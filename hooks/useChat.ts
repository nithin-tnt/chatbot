import { useState, useCallback } from 'react';
import type { Message, TokenUsage } from '@/lib/types';
import { App } from 'antd';

export const useChat = (sessionId: string, userId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { message: messageApi } = App.useApp();

  const sendMessage = useCallback(async (content: string): Promise<TokenUsage | undefined> => {
    if (!content.trim() || !sessionId) return undefined;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      status: 'success',
    };

    setMessages((prev) => [...prev, userMessage]);

    const streamingMessageId = 'streaming';
    const streamingMessage: Message = {
      id: streamingMessageId,
      content: '',
      role: 'assistant',
      status: 'success',
    };
    setMessages((prev) => [...prev, streamingMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let usage: TokenUsage | undefined;

      if (!reader) {
        throw new Error('No response stream available');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream reading complete');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        // Split by newline and process each line separately
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (!trimmedLine || trimmedLine === '') {
            continue; // Skip empty lines
          }
          
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                console.error('Stream error received:', parsed.error);
                throw new Error(parsed.error);
              }
              
              if (parsed.content) {
                fullContent += parsed.content;
                
                // Update the streaming message with accumulated content
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingMessageId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
              
              // Capture usage data
              if (parsed.usage) {
                usage = parsed.usage;
                console.log('Received usage data:', usage);
              }
            } catch (e) {
              console.error('Failed to parse stream data:', trimmedLine, e);
            }
          }
        }
      }

      // Replace streaming message with final message including usage
      const finalMessage: Message = {
        id: Date.now().toString(),
        content: fullContent || 'Response received but was empty.',
        role: 'assistant',
        status: fullContent ? 'success' : 'error',
        usage: usage,
      };

      setMessages((prev) => prev.filter((m) => m.id !== streamingMessageId).concat(finalMessage));

      console.log('Final message created with content length:', fullContent.length, 'usage:', usage);
      
      return usage;
    } catch (error) {
      console.error('Streaming error caught:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, the response was interrupted. Please try again.',
        role: 'assistant',
        status: 'error',
      };

      setMessages((prev) => prev.filter((m) => m.id !== streamingMessageId).concat(errorMessage));
      messageApi.error('Stream interrupted. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, userId, messageApi]);

  const loadMessages = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/messages?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          status: 'success' as const,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    loadMessages,
    clearMessages,
    setMessages,
  };
};
