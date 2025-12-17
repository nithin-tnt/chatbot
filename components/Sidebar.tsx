'use client';

import { Button, Avatar, Dropdown } from 'antd';
import { PlusOutlined, DeleteOutlined, MessageOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import type { ChatSession, UserProfile } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

interface SidebarProps {
  chatSessions: ChatSession[];
  currentSession: ChatSession | null;
  userProfile: UserProfile | null;
  userEmail: string;
  loading: boolean;
  onNewChat: () => void;
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
}

export const Sidebar = ({
  chatSessions,
  currentSession,
  userProfile,
  userEmail,
  loading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onOpenProfile,
  onSignOut,
}: SidebarProps) => {
  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Profile Settings',
      onClick: onOpenProfile,
    },
    {
      key: 'signout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: onSignOut,
    },
  ];

  return (
    <div className="w-64 border-r flex flex-col" style={{ 
      borderColor: '#e5e7eb',
      background: '#ffffff',
    }}>
      {/* Sidebar Header */}
      <div className="p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
        <Button
          icon={<PlusOutlined />}
          onClick={onNewChat}
          loading={loading}
          block
          size="large"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            height: '40px',
            borderRadius: '10px',
            fontWeight: 500,
          }}
        >
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        {chatSessions.map((session) => (
          <div
            key={session.id}
            className="mb-2 p-3 rounded-lg cursor-pointer group relative transition-all"
            style={{
              background: currentSession?.id === session.id 
                ? 'rgba(102, 126, 234, 0.1)' 
                : 'transparent',
              border: `1px solid ${currentSession?.id === session.id 
                ? 'rgba(102, 126, 234, 0.3)' 
                : 'transparent'}`,
            }}
            onClick={() => onSelectSession(session)}
            onMouseEnter={(e) => {
              if (currentSession?.id !== session.id) {
                e.currentTarget.style.background = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (currentSession?.id !== session.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageOutlined style={{ color: '#6b7280', flexShrink: 0 }} />
                <span className="text-sm truncate" style={{ color: '#111827' }}>
                  {session.title}
                </span>
              </div>
              <Button
                icon={<DeleteOutlined />}
                type="text"
                size="small"
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                style={{ color: '#6b7280' }}
              />
            </div>
            <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
              {formatRelativeTime(session.updated_at)}
            </div>
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="p-4 border-t" style={{ borderColor: '#e5e7eb' }}>
        <Dropdown menu={{ items: userMenuItems }} placement="topRight">
          <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <Avatar style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              {userEmail?.[0]?.toUpperCase()}
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                {userProfile?.full_name || 'User'}
              </div>
              <div className="text-xs truncate" style={{ color: '#6b7280' }}>
                {userEmail}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};
