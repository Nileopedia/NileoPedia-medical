import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/appStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useSocket = () => {
  const addNotification = useAppStore((state) => state.addNotification);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('notification', (notification) => {
      addNotification(notification);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [addNotification]);
};

export const useNotifications = () => {
  const notifications = useAppStore((state) => state.notifications);
  const markAsRead = useAppStore((state) => state.markNotificationRead);
  const clearNotifications = useAppStore((state) => state.clearNotifications);

  return {
    notifications,
    markAsRead,
    clearNotifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
};