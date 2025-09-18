import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Brain, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Welcome to your personal Salti Coach! 🎯\n\nI'm here to help you build better saving habits and reach your financial goals. I can help you with:\n\n• Personalized saving strategies\n• Spending analysis and optimization\n• Goal setting and tracking\n• Future value projections\n• Habit formation tips\n\nWhat would you like to work on today?",
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`https://vmpnajdvcipfuusnjnfr.supabase.co/functions/v1/chat-support`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          sessionId
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let assistantMessage = '';
      let currentSessionId = sessionId;

      setMessages(prev => [...prev, {
        id: 'streaming',
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  
                  if (lastMessage?.id === 'streaming') {
                    lastMessage.content = assistantMessage;
                  }
                  return newMessages;
                });
              }
              if (parsed.sessionId && !currentSessionId) {
                currentSessionId = parsed.sessionId;
                setSessionId(parsed.sessionId);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage?.id === 'streaming') {
          lastMessage.id = Date.now().toString();
        }
        return newMessages;
      });

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    { text: "How can I save $100 more per month?", icon: Target },
    { text: "What if I saved $5 daily for 10 years?", icon: TrendingUp },
    { text: "Analyze my spending patterns", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Salti Coach</h1>
              <p className="text-muted-foreground">Your personal AI financial coach</p>
            </div>
          </div>
          
          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 mt-4">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setCurrentMessage(prompt.text)}
                className="h-auto py-2 px-3 text-left"
                disabled={isLoading}
              >
                <prompt.icon className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-xs">{prompt.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="h-[60vh] flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Online
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Ready to help you build wealth
                </span>
              </div>
              {sessionId && (
                <Badge variant="outline" className="text-xs">
                  Session Active
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <MessageCircle className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        message.role === 'user'
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted text-foreground whitespace-pre-wrap"
                      )}
                    >
                      {message.content}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs text-primary-foreground font-medium">
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted text-foreground rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input Area */}
            <div className="border-t p-6">
              <div className="flex gap-3">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about saving strategies, goals, or projections..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !currentMessage.trim()}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}