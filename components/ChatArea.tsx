'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { Bubble, Sender, Welcome } from '@ant-design/x';
import { DeleteOutlined, RobotOutlined } from '@ant-design/icons';
import type { Message, TokenUsage } from '@/lib/types';
import { scrollToBottom } from '@/lib/utils';

interface ChatAreaProps {
  messages: Message[];
  loading: boolean;
  isLoadingMessages: boolean;
  totalUsage: TokenUsage;
  onSend: (message: string) => Promise<any>;
  onClear: () => void;
}

export const ChatArea = ({
  messages,
  loading,
  isLoadingMessages,
  totalUsage,
  onSend,
  onClear,
}: ChatAreaProps) => {
  const [inputValue, setInputValue] = useState('');
  const senderRef = useRef<any>(null);

  useEffect(() => {
    scrollToBottom('chat-messages-container');
  }, [messages]);

  const handleSend = async (message: string) => {
    await onSend(message);
    setInputValue(''); // Clear the input after sending
    
    // Refocus the input after sending
    setTimeout(() => {
      if (senderRef.current?.focus) {
        senderRef.current.focus();
      }
    }, 100);
  };

  const suggestedPrompts = [
    'Tell me a story',
    'Explain quantum computing',
    'Help me brainstorm ideas',
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{
          borderColor: '#e5e7eb',
          background: '#ffffff',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <RobotOutlined style={{ fontSize: '20px', color: 'white' }} />
          </div>
          <div>
            <h1 className="text-lg font-semibold m-0" style={{ color: '#111827' }}>
              Middleware AI Assistant
            </h1>
            <p className="text-xs m-0" style={{ color: '#6b7280' }}>
              Powered by OpenRouter
              {totalUsage.totalTokens > 0 &&
                ` • ${totalUsage.totalTokens.toLocaleString()} tokens`}
            </p>
          </div>
        </div>

        <Button
          icon={<DeleteOutlined />}
          onClick={onClear}
          size="small"
          type="text"
          style={{
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          Clear
        </Button>
      </div>

      {/* Chat Messages */}
      <div
        id="chat-messages-container"
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ background: '#f9fafb' }}
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{
                  borderColor: '#667eea',
                  borderTopColor: 'transparent',
                }}
              />
              <p style={{ color: '#6b7280' }}>Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <Welcome
            variant="borderless"
            icon={
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <RobotOutlined style={{ fontSize: '32px', color: 'white' }} />
              </div>
            }
            title={
              <span style={{ color: '#111827', fontSize: '24px', fontWeight: 600 }}>
                Hello! How can I help you today?
              </span>
            }
            description={
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                Start a conversation or ask me &quot;Who am I?&quot; after chatting to
                get your personality profile
              </span>
            }
            extra={
              <div className="flex flex-wrap gap-2 mt-4">
                {suggestedPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    style={{
                      background: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: '8px',
                      height: 'auto',
                      padding: '8px 16px',
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            }
            style={{
              background: 'transparent',
              maxWidth: '600px',
              margin: '80px auto 0',
            }}
          />
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                <Bubble
                  content={msg.content || <span><span className="inline-block animate-spin mr-2">⏳</span>Thinking...</span>}
                  avatar={msg.role === 'assistant' ? <RobotOutlined /> : undefined}
                  placement={msg.role === 'user' ? 'end' : 'start'}
                  typing={msg.id === 'streaming' && !msg.content}
                  variant="borderless"
                  styles={{
                    content: {
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#ffffff',
                      color: msg.role === 'user' ? 'white' : '#111827',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
                      boxShadow:
                        msg.role === 'assistant'
                          ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                          : 'none',
                    },
                  }}
                />
                {msg.role === 'assistant' && msg.usage && (
                  <div
                    className="text-xs mt-1"
                    style={{
                      color: '#9ca3af',
                      paddingLeft: '48px',
                    }}
                  >
                    {msg.usage.totalTokens} tokens ({msg.usage.promptTokens} prompt +{' '}
                    {msg.usage.completionTokens} completion)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        className="px-6 py-4 border-t"
        style={{
          borderColor: '#e5e7eb',
          background: '#ffffff',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <Sender
            ref={senderRef}
            value={inputValue}
            onChange={setInputValue}
            placeholder="Type your message..."
            onSubmit={handleSend}
            loading={loading}
            disabled={loading}
          />
          <p
            className="text-xs text-center mt-2 m-0"
            style={{ color: '#9ca3af' }}
          >
            Powered by OpenRouter • Conversations stored securely
          </p>
        </div>
      </div>
    </div>
  );
};
