'use client';

import { useState } from 'react';
import { Button, Input, Form } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

interface AuthFormProps {
  loading: boolean;
  onAuth: (values: { email: string; password: string; full_name?: string }, mode: 'signin' | 'signup') => Promise<void>;
}

export const AuthForm = ({ loading, onAuth }: AuthFormProps) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (values: any) => {
    await onAuth(values, authMode);
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="text-center max-w-md w-full px-4 md:px-6">
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <RobotOutlined className="text-3xl md:text-5xl" style={{ color: 'white' }} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3" style={{ color: '#111827' }}>
          Middleware AI Assistant
        </h1>
        <p className="text-sm md:text-base mb-6 md:mb-8" style={{ color: '#6b7280' }}>
          {authMode === 'signin'
            ? 'Sign in to continue your conversations'
            : 'Create an account to get started'}
        </p>

        <div className="text-left">
          <Form onFinish={handleSubmit} layout="vertical">
            {authMode === 'signup' && (
              <Form.Item
                name="full_name"
                label={<span style={{ color: '#111827' }}>Full Name</span>}
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input
                  placeholder="Enter your name"
                  size="large"
                  disabled={loading}
                />
              </Form.Item>
            )}
            <Form.Item
              name="email"
              label={<span style={{ color: '#111827' }}>Email</span>}
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input
                placeholder="you@example.com"
                size="large"
                disabled={loading}
                className='border border-solid border-amber-200'
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span style={{ color: '#111827' }}>Password</span>}
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                placeholder="••••••••"
                size="large"
                disabled={loading}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: '48px',
                fontSize: '16px',
                fontWeight: 500,
                borderRadius: '10px',
                marginTop: '8px',
              }}
            >
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
            <div className="text-center mt-4">
              <Button
                type="link"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                disabled={loading}
              >
                {authMode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};
