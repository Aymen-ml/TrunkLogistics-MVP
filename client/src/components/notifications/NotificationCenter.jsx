import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Filter, RefreshCw, BellOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationCenter = () => {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    isNotificationCenterOpen,
    notificationsEnabled,
    closeNotificationCenter,
    fetchNotifications: contextFetchNotifications,
    markAsRead: contextMarkAsRead,
    markAllAsRead: contextMarkAllAsRead,
    deleteNotification: contextDeleteNotification
  } = useNotifications();
  
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    if (isNotificationCenterOpen) {
      loadNotifications();
    }
  }, [isNotificationCenterOpen, filter]);

  const loadNotifications = async (pageNum = 1) => {
    const params = {
      limit: 20,
      offset: (pageNum - 1) * 20,
      ...(filter === 'unread' && { is_read: false }),
      ...(filter === 'read' && { is_read: true })
    };

    const newNotifications = await contextFetchNotifications({
      ...params,
      append: pageNum > 1
    });

    setHasMore(newNotifications.length === 20);
    setPage(pageNum);
    
    // Update local notifications for filtering
    if (pageNum === 1) {
      setLocalNotifications(newNotifications);
    } else {
      setLocalNotifications(prev => [...prev, ...newNotifications]);
    }
  };

  // Use context functions directly

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_created':
      case 'booking_status':
        return '📦';
      case 'document_uploaded':
      case 'document_verified':
        return '📄';
      case 'provider_verified':
        return '✅';
      case 'admin_alert':
        return '⚠️';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1);
    }
  };

  // Get the notifications to display (use filtered local notifications or context notifications)
  const displayNotifications = localNotifications.length > 0 ? localNotifications : notifications;

  if (!isNotificationCenterOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeNotificationCenter} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <button
            onClick={closeNotificationCenter}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Controls */}
        {notificationsEnabled && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadNotifications(1)}
                  disabled={loading}
                  className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={contextMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {!notificationsEnabled ? (
            // Notifications Disabled State
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <BellOff className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications Disabled</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-xs">
                You have disabled notifications in your settings. Enable them to receive updates about bookings and messages.
              </p>
              <a
                href="/settings"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Settings
              </a>
            </div>
          ) : loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-sm text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.is_read && (
                            <button
                              onClick={() => contextMarkAsRead(notification.id)}
                              className="p-1 rounded-full hover:bg-gray-200"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3 text-gray-500" />
                            </button>
                          )}
                          <button
                            onClick={() => contextDeleteNotification(notification.id)}
                            className="p-1 rounded-full hover:bg-gray-200"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="p-4 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
