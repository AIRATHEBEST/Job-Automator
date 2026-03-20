import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from './database';
import sql from './db';
import { getStoredUser } from './auth';

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

      const results = await sql`
        SELECT * FROM notifications 
        WHERE user_id = ${user.userId} 
        ORDER BY created_at DESC 
        LIMIT 50
      ` as unknown as Notification[];

      setNotifications(results);
      setUnreadCount(results.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await sql`UPDATE notifications SET read = true WHERE id = ${id}`;
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = await getStoredUser();
      if (!user) return;

      await sql`UPDATE notifications SET read = true WHERE user_id = ${user.userId}`;
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
      await sql`
        INSERT INTO notifications (id, user_id, type, title, message, link) 
        VALUES (${crypto.randomUUID()}, ${userId}, ${type}, ${title}, ${message}, ${link || null})
      `;
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
