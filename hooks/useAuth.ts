import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkUser = useCallback(async () => {
    setIsCheckingAuth(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return {
    user,
    setUser,
    isCheckingAuth,
    checkUser,
  };
};
