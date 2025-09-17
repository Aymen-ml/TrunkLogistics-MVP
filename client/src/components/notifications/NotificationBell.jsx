import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';

const NotificationBell = () => {
  const { user } = useAuth();
  const { 
    unreadCount, 
    isNotificationCenterOpen, 
    toggleNotificationCenter 
  } = useNotifications();

  if (!user) return null;

  return (
    <>
      <button
        onClick={toggleNotificationCenter}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter />
    </>
  );
};

export default NotificationBell;
