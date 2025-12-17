'use client';

import { useState, useEffect, useCallback } from 'react';
import { App, ConfigProvider } from 'antd';
import { signIn, signUp, signOut } from '@/lib/auth';
import { getUserProfile, updateUserProfile } from '@/lib/db';
import type { UserProfile, TokenUsage } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useChatSessions } from '@/hooks/useChatSessions';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { AuthForm } from '@/components/AuthForm';
import { ProfileModal } from '@/components/ProfileModal';

function ChatApp() {
  const { message: messageApi } = App.useApp();
  const { user, setUser, isCheckingAuth } = useAuth();
  const { chatSessions, currentSession, setCurrentSession, loadSessions, createSession, deleteSession } = useChatSessions(user?.id);
  const { messages, loading, sendMessage, loadMessages, clearMessages, setMessages } = useChat(currentSession?.id || '', user?.id);
  
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [totalUsage, setTotalUsage] = useState<TokenUsage>({ 
    promptTokens: 0, 
    completionTokens: 0, 
    totalTokens: 0 
  });

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      try {
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadUserProfile();
  }, [user]);

  // Load chat sessions on mount
  useEffect(() => {
    const initializeSessions = async () => {
      if (!user) return;
      
      const sessions = await loadSessions();
      
      if (sessions && sessions.length > 0) {
        const firstSession = sessions[0];
        setCurrentSession(firstSession);
        await handleLoadMessages(firstSession.id);
      } else {
        // Create first session for new users
        await handleNewChat();
      }
    };

    initializeSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLoadMessages = async (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      await loadMessages(sessionId);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleAuth = async (values: { email: string; password: string; full_name?: string }, mode: 'signin' | 'signup') => {
    try {
      if (mode === 'signin') {
        await signIn(values.email, values.password);
      } else {
        await signUp(values.email, values.password, values.full_name!);
      }
      
      const { getCurrentUser } = await import('@/lib/auth');
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      messageApi.success(mode === 'signin' ? 'Signed in successfully!' : 'Account created successfully!');
    } catch (error: any) {
      messageApi.error(error.message || 'Authentication failed');
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      clearMessages();
      setCurrentSession(null);
      messageApi.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      messageApi.success('Signed out successfully');
    }
  };

  const handleNewChat = async () => {
    const session = await createSession();
    if (session) {
      clearMessages();
      setTotalUsage({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    }
  };

  const handleSelectSession = async (session: typeof currentSession) => {
    if (!session) return;
    setCurrentSession(session);
    setTotalUsage({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    await handleLoadMessages(session.id);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const wasCurrentSession = currentSession?.id === sessionId;
    const success = await deleteSession(sessionId);
    
    if (success && wasCurrentSession) {
      // Find another session to switch to, or create a new one
      const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
      
      if (remainingSessions.length > 0) {
        await handleSelectSession(remainingSessions[0]);
      } else {
        // Only create new chat if there are no sessions left
        await handleNewChat();
      }
    }
  };

  const handleUpdateProfile = async (values: { full_name: string }) => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.id, values);
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);
      setShowProfile(false);
      messageApi.success('Profile updated successfully');
    } catch (error) {
      messageApi.error('Failed to update profile');
    }
  };

  const handleSend = async (content: string) => {
    const usage = await sendMessage(content);
    
    if (usage) {
      setTotalUsage(prev => ({
        promptTokens: prev.promptTokens + (usage.promptTokens || 0),
        completionTokens: prev.completionTokens + (usage.completionTokens || 0),
        totalTokens: prev.totalTokens + (usage.totalTokens || 0),
      }));
    }
  };

  const handleClear = async () => {
    if (!currentSession) return;
    
    try {
      await fetch('/api/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSession.id }),
      });
      clearMessages();
      setTotalUsage({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#f9fafb' }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: '#667eea',
              borderTopColor: 'transparent',
            }}
          />
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen" style={{ background: '#f9fafb' }}>
        <AuthForm loading={false} onAuth={handleAuth} />
      </div>
    );
  }

  return (
    <div className="h-screen flex" style={{ background: '#f9fafb' }}>
      <Sidebar
        chatSessions={chatSessions}
        currentSession={currentSession}
        userProfile={userProfile}
        userEmail={user.email}
        loading={loading}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onOpenProfile={() => setShowProfile(true)}
        onSignOut={handleSignOut}
      />

      <ChatArea
        messages={messages}
        loading={loading}
        isLoadingMessages={isLoadingMessages}
        totalUsage={totalUsage}
        onSend={handleSend}
        onClear={handleClear}
      />

      <ProfileModal
        open={showProfile}
        userProfile={userProfile}
        onClose={() => setShowProfile(false)}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
}

export default function Home() {
  return (
      <App>
        <ChatApp />
      </App>
  );
}
