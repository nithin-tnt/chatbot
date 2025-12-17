import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side helper - determines which client to use
const getClient = () => {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    // Use service role key on server
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      return createClient(supabaseUrl, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }
  return supabase;
};

export interface Message {
  id?: string;
  user_id?: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
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

export async function saveMessage(message: Message) {
  const client = getClient();
  const { data, error } = await client
    .from('conversations')
    .insert([message])
    .select();

  if (error) throw error;
  return data;
}

export async function getConversationHistory(sessionId: string, limit = 50) {
  const client = getClient();
  const { data, error } = await client
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data as Message[];
}

export async function clearConversation(sessionId: string) {
  const client = getClient();
  const { error } = await client
    .from('conversations')
    .delete()
    .eq('session_id', sessionId);

  if (error) throw error;
}

// Chat Sessions
export async function getChatSessions(userId: string) {
  const client = getClient();
  const { data, error } = await client
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as ChatSession[];
}

export async function createChatSession(userId: string, title?: string) {
  const client = getClient();
  const { data, error } = await client
    .from('chat_sessions')
    .insert([{ user_id: userId, title: title || 'New Chat' }])
    .select()
    .single();

  if (error) throw error;
  return data as ChatSession;
}

export async function updateChatSession(sessionId: string, updates: Partial<ChatSession>) {
  const client = getClient();
  const { data, error } = await client
    .from('chat_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data as ChatSession;
}

export async function deleteChatSession(sessionId: string) {
  const client = getClient();
  const { error } = await client
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}

// User Profile
export async function getUserProfile(userId: string) {
  const client = getClient();
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return data as UserProfile | null;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const client = getClient();
  const { data, error } = await client
    .from('user_profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}
