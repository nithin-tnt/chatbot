import { useState, useCallback } from 'react';
import { getChatSessions, createChatSession, deleteChatSession } from '@/lib/db';
import type { ChatSession } from '@/lib/types';
import { App } from 'antd';

export const useChatSessions = (userId: string | undefined) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const { message } = App.useApp();

  const loadSessions = useCallback(async () => {
    if (!userId) return;
    
    try {
      const sessions = await getChatSessions(userId);
      setChatSessions(sessions || []);
      return sessions || [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }, [userId]);

  const createSession = useCallback(async (title: string = 'New Chat'): Promise<ChatSession | null> => {
    if (!userId) return null;

    try {
      const session = await createChatSession(userId, title);
      setChatSessions((prev) => [session, ...prev]);
      setCurrentSession(session);
      return session;
    } catch (error) {
      message.error('Failed to create chat');
      return null;
    }
  }, [userId, message]);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      await deleteChatSession(sessionId);
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
      message.success('Chat deleted');
      return true;
    } catch (error) {
      message.error('Failed to delete chat');
      return false;
    }
  }, [message]);

  return {
    chatSessions,
    currentSession,
    setCurrentSession,
    loadSessions,
    createSession,
    deleteSession,
    setChatSessions,
  };
};
