import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { FirstUsePrompt } from '@/components/ai/FirstUsePrompt';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  triggerFirstUse?: 'csv_upload' | 'first_budget' | 'first_save' | 'streak_milestone' | null;
}

export function ChatWidget({ triggerFirstUse }: ChatWidgetProps = {}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your Salti Coach 🎯\n\nTry asking:\n• \"How can I save $100 more per month?\"\n• \"What if I saved $5 daily for 10 years?\"\n• \"Analyze my spending patterns\"\n\nI'm here to help you stack smarter!",
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  // Don't show chat widget if user is not authenticated
  if (!user) return null;

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
      // Use simplified Supabase function invoke with streaming
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

      // Add placeholder for streaming response
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

      // Finalize the streaming message
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
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. Make sure you've set up your OpenAI API key in the Supabase secrets.",
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 w-80 h-96">
      <Card className="h-full flex flex-col shadow-xl border-border/50">
        <CardHeader className="flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-primary/10 to-accent/5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Salti Coach</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Typing...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t border-border/50 p-4">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={messages.length <= 1 ? "Try: 'How can I save $100 more per month?'" : "Ask me anything..."}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                size="sm"
                disabled={isLoading || !currentMessage.trim()}
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}