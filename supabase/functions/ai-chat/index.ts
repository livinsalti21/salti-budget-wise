import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { message, sessionId } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('AI Chat request from user:', user.id);

    // Get or create session
    let session;
    if (sessionId) {
      const { data: existingSession } = await supabaseClient
        .from('ai_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();
      session = existingSession;
    }

    if (!session) {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('ai_chat_sessions')
        .insert({
          user_id: user.id,
          context: {}
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      session = newSession;
    }

    // Get user context for personalization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('total_saved_cents, current_streak_days, total_saves_count')
      .eq('id', user.id)
      .single();

    const { data: recentSaves } = await supabaseClient
      .from('save_events')
      .select('amount_cents, reason, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: goals } = await supabaseClient
      .from('stacklets')
      .select('title, target_cents, progress_cents, emoji')
      .eq('user_id', user.id)
      .eq('is_archived', false);

    // Build context-aware system prompt
    const systemPrompt = `You are Livin Salti's AI Financial Coach. You're friendly, motivational, and help users save money and build wealth.

User Context:
- Total Saved: $${(profile?.total_saved_cents || 0) / 100}
- Current Streak: ${profile?.current_streak_days || 0} days
- Total Saves: ${profile?.total_saves_count || 0}
- Recent Saves: ${recentSaves?.map(s => `$${s.amount_cents / 100} (${s.reason})`).join(', ') || 'None yet'}
- Active Goals: ${goals?.map(g => `${g.emoji} ${g.title}: $${g.progress_cents / 100}/$${g.target_cents / 100}`).join(', ') || 'None yet'}

Guidelines:
- Keep responses concise (2-3 sentences)
- Be encouraging and celebrate wins
- Give specific, actionable advice
- Reference their actual data when relevant
- If they ask about features, explain: Save n Stack, Goals, Match-a-Save, Streaks
- Suggest creating budgets, goals, or connecting with sponsors when appropriate`;

    // Get conversation history
    const { data: messages } = await supabaseClient
      .from('ai_chat_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(20);

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []),
      { role: 'user', content: message }
    ];

    // Call Lovable AI Gateway with streaming
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: conversationMessages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI error:', error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'AI service is busy. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits depleted. Please contact support.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('Failed to get AI response');
    }

    // Store user message
    await supabaseClient.from('ai_chat_messages').insert({
      session_id: session.id,
      role: 'user',
      content: message
    });

    // Stream response back to client
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  console.error('Parse error:', e);
                }
              }
            }
          }

          // Store assistant response
          if (fullResponse) {
            await supabaseClient.from('ai_chat_messages').insert({
              session_id: session.id,
              role: 'assistant',
              content: fullResponse
            });

            // Update session
            await supabaseClient
              .from('ai_chat_sessions')
              .update({
                last_message_at: new Date().toISOString(),
                message_count: (session.message_count || 0) + 2
              })
              .eq('id', session.id);
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
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

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});