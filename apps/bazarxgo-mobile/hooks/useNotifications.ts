import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { useNotificationStore } from '../store/notification';

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    clearUnread, 
    init, 
    disconnect 
  } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      init(user.id);
    } else {
      disconnect();
    }
  }, [isAuthenticated, user?.id]);

  return { notifications, unreadCount, clearUnread };
};
