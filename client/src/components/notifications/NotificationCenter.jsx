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
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid date';
      }
      
      const diffInMilliseconds = now - date;
      const diffInMinutes = diffInMilliseconds / (1000 * 60);
      const diffInHours = diffInMinutes / 60;
      const diffInDays = diffInHours / 24;

      // Less than 1 minute
      if (diffInMinutes < 1) {
        return 'Just now';
      }
      // Less than 1 hour
      else if (diffInMinutes < 60) {
        const mins = Math.floor(diffInMinutes);
        return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
      }
      // Less than 24 hours
      else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      }
      // Less than 7 days
      else if (diffInDays < 7) {
        const days = Math.floor(diffInDays);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      }
      // Less than 30 days
      else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      }
      // Show full date
      else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
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
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
          </div>
          <button
            onClick={closeNotificationCenter}
            className="p-1 rounded-full hover:bg-gray-100 dark:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        {/* Controls */}
        {notificationsEnabled && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-blue-500"
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
                  title="Refresh notifications"
                >
                  <RefreshCw className={`h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={contextMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-accent-600 transition-colors font-medium"
                >
                  Mark all read
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {!notificationsEnabled ? (
            // Notifications Disabled State
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 mb-4">
                <BellOff className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Notifications Disabled</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4 max-w-xs">
                You have disabled notifications in your settings. Enable them to receive updates about bookings and messages.
              </p>
              <a
                href="/settings"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 transition-colors"
              >
                Go to Settings
              </a>
            </div>
          ) : loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No notifications</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-xl mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`text-base font-semibold mb-1 ${
                            !notification.is_read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium">
                              {formatDate(notification.created_at)}
                            </p>
                            {!notification.is_read && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                contextMarkAsRead(notification.id);
                              }}
                              className="p-2 rounded-full hover:bg-blue-100 dark:bg-blue-900 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4 text-primary-600" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              contextDeleteNotification(notification.id);
                            }}
                            className="p-2 rounded-full hover:bg-red-100 dark:bg-red-900 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadMore();
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-primary-600 hover:text-accent-600 transition-colors font-medium disabled:opacity-50 hover:bg-accent-50 rounded-md transition-colors"
                  >
                    {loading ? 'Loading...' : 'Load more notifications'}
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
