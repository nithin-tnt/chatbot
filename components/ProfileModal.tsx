'use client';

import { Modal, Form, Input, Button } from 'antd';
import type { UserProfile } from '@/lib/types';

interface ProfileModalProps {
  open: boolean;
  userProfile: UserProfile | null;
  onClose: () => void;
  onUpdate: (values: { full_name: string }) => Promise<void>;
}

export const ProfileModal = ({
  open,
  userProfile,
  onClose,
  onUpdate,
}: ProfileModalProps) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={<span style={{ color: '#111827' }}>Profile Settings</span>}
      styles={{
        body: {
          background: '#ffffff',
        },
      }}
    >
      <Form
        onFinish={onUpdate}
        layout="vertical"
        initialValues={{
          full_name: userProfile?.full_name || '',
        }}
      >
        <Form.Item
          name="full_name"
          label={<span style={{ color: '#111827' }}>Full Name</span>}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            height: '40px',
            marginTop: '10px',
          }}
        >
          Save Changes
        </Button>
      </Form>
    </Modal>
  );
};
