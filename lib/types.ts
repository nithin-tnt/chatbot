export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  status?: 'success' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
