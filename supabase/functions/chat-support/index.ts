import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  function_call?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { message, sessionId } = await req.json();
    
    // Get or create session
    let session;
    if (sessionId) {
      const { data } = await supabaseClient
        .from('ai_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      session = data;
    }
    
    if (!session) {
      const { data: newSession } = await supabaseClient
        .from('ai_sessions')
        .insert({
          user_id: user.id,
          metadata: { type: 'support_chat' }
        })
        .select()
        .single();
      session = newSession;
    }

    // Get user context for function calling
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: userStats } = await supabaseClient
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Store user message
    await supabaseClient
      .from('ai_messages')
      .insert({
        session_id: session.id,
        user_id: user.id,
        role: 'user',
        content: message
      });

    // Get recent conversation
    const { data: recentMessages } = await supabaseClient
      .from('ai_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const conversationHistory: ChatMessage[] = recentMessages
      ?.reverse()
      .map(msg => ({ role: msg.role as any, content: msg.content })) || [];

    const systemPrompt = `You are the Livin Salti support assistant. You help users with their financial wellness journey through our savings app.

Key features of Livin Salti:
- Save Stack system for organizing saves into different goals (stacklets)
- Streak tracking to build saving habits
- Match system where sponsors can match user saves
- Budget tracking and financial planning tools
- Community features for accountability

User Context:
- Current user: ${profile?.display_name || 'User'}
- Plan: ${profile?.plan || 'Free'}
- Current streak: ${userStats?.consecutive_days || 0} days
- Onboarding completed: ${profile?.completed_onboarding ? 'Yes' : 'No'}

Be helpful, encouraging, and focus on financial wellness. Keep responses concise and actionable.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Use GPT-5 if available, fallback to GPT-4o
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages,
        max_completion_tokens: 500,
        stream: true,
        functions: [
          {
            name: 'getUserStats',
            description: 'Get current user statistics like streaks, saves, etc.',
            parameters: {
              type: 'object',
              properties: {},
            }
          },
          {
            name: 'troubleshootSaving',
            description: 'Help troubleshoot saving issues',
            parameters: {
              type: 'object',
              properties: {
                issue: { type: 'string', description: 'The saving issue to troubleshoot' }
              }
            }
          }
        ],
        function_call: 'auto'
      }),
    });

    if (!response.ok) {
      // Try GPT-4o fallback
      const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          max_tokens: 500,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!fallbackResponse.ok) {
        throw new Error(`OpenAI API error: ${fallbackResponse.status}`);
      }

      return handleStreamResponse(fallbackResponse, supabaseClient, session.id, user.id);
    }

    return handleStreamResponse(response, supabaseClient, session.id, user.id);

  } catch (error) {
    console.error('Error in chat-support function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleStreamResponse(response: Response, supabaseClient: any, sessionId: string, userId: string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let fullResponse = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  fullResponse += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content, sessionId })}\n\n`));
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        // Store complete response
        if (fullResponse) {
          await supabaseClient
            .from('ai_messages')
            .insert({
              session_id: sessionId,
              user_id: userId,
              role: 'assistant',
              content: fullResponse
            });
        }

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}