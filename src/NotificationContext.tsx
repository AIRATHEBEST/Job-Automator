import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types/database';
import { query } from '../lib/db';
import { getStoredUser } from '../lib/auth';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (userId: string, type: string, title: string, message: string, link?: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const user = await getStoredUser();
      if (!user) return;

      const results = await query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
        [user.userId]
      ) as Notification[];

      setNotifications(results);
      setUnreadCount(results.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await query('UPDATE notifications SET read = true WHERE id = $1', [id]);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = await getStoredUser();
      if (!user) return;

      await query('UPDATE notifications SET read = true WHERE user_id = $1', [user.userId]);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string
  ) => {
    try {
      await query(
        'INSERT INTO notifications (id, user_id, type, title, message, link) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)',
        [userId, type, title, message, link || null]
      );
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        createNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
