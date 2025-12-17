'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { Bubble, Sender } from '@ant-design/x';
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
        style={{
          borderColor: '#e5e7eb',
          background: '#ffffff',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <RobotOutlined className="text-base md:text-xl" style={{ color: 'white' }} />
          </div>
          <div className="min-w-0 overflow-hidden">
            <h1 className="text-base md:text-lg font-semibold m-0 truncate" style={{ color: '#111827' }}>
              Middleware AI Assistant
            </h1>
            <p className="text-xs m-0 truncate" style={{ color: '#6b7280' }}>
              <span className="hidden sm:inline">Powered by OpenRouter</span>
              {totalUsage.totalTokens > 0 && (
                <>
                  <span className="hidden sm:inline"> • </span>
                  {totalUsage.totalTokens.toLocaleString()} tokens
                </>
              )}
            </p>
          </div>
        </div>

        <Button
          icon={<DeleteOutlined />}
          onClick={onClear}
          size="small"
          type="text"
          className="flex-shrink-0"
          style={{
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        >
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>

      {/* Chat Messages */}
      <div
        id="chat-messages-container"
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6"
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
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 md:mb-6"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <RobotOutlined className="text-3xl md:text-4xl" style={{ color: 'white' }} />
            </div>
            <h1 className="text-xl md:text-3xl font-semibold mb-2 md:mb-3" style={{ color: '#111827' }}>
              Hello! How can I help you today?
            </h1>
            <p className="text-sm md:text-base mb-6 md:mb-8 max-w-md" style={{ color: '#6b7280' }}>
              Start a conversation or ask me &quot;Who am I?&quot; after chatting to get your personality profile
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center max-w-lg">
              {suggestedPrompts.map((prompt, i) => (
                <Button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  size="middle"
                  className="text-sm"
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
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
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
                      padding: '10px 14px',
                      fontSize: '14px',
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
                      paddingLeft: '0px',
                    }}
                  >
                    <span className="sm:ml-12">
                      {msg.usage.totalTokens} tokens
                      <span className="hidden sm:inline">
                        {' '}({msg.usage.promptTokens} prompt + {msg.usage.completionTokens} completion)
                      </span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        className="px-3 md:px-6 py-3 md:py-4 border-t"
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
            className="text-xs text-center mt-2 m-0 hidden sm:block"
            style={{ color: '#9ca3af' }}
          >
            Powered by OpenRouter • Conversations stored securely
          </p>
        </div>
      </div>
    </div>
  );
};
