import React, { useEffect, useState } from 'react';
import { Sun, Moon, Save, Bell, BellOff, Check, AlertCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../utils/apiClient';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('i18nextLng') || i18n.language);
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('notificationsEnabled');
    return stored ? JSON.parse(stored) : true;
  });
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Apply theme immediately when changed
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Track unsaved changes
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('i18nextLng') || i18n.language;
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    const savedNotificationsValue = savedNotifications ? JSON.parse(savedNotifications) : true;
    
    const hasChanges = theme !== savedTheme || language !== savedLanguage || notifications !== savedNotificationsValue;
    setHasUnsavedChanges(hasChanges);
  }, [theme, language, notifications, i18n.language]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save theme to backend (user-specific)
      await apiClient.put('/users/preferences/theme', { theme });
      
      // Persist preferences to localStorage (as backup)
      localStorage.setItem('theme', theme);
      localStorage.setItem('notificationsEnabled', JSON.stringify(notifications));
      
      // Apply language change
      if (language !== i18n.language) {
        i18n.changeLanguage(language);
      }
      
      // Ensure theme is applied immediately
      document.documentElement.classList.toggle('dark', theme === 'dark');
      
      // Dispatch custom event to notify NotificationContext of the change
      window.dispatchEvent(new Event('notificationSettingsChanged'));
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showSuccess(notifications 
        ? t('settings.savedSuccessNotifications')
        : t('settings.savedSuccessNoNotifications')
      );
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      showError(t('settings.savedError'));
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // Apply immediately for instant feedback
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('settings.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                {theme === 'dark' ? <Moon className="h-5 w-5 mr-2 text-primary-600" /> : <Sun className="h-5 w-5 mr-2 text-yellow-500" />}
                {t('settings.theme.title')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.theme.subtitle')}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow'
                  }`}
                >
                  <Sun className={`h-8 w-8 mb-2 ${theme === 'light' ? 'text-accent-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {t('settings.theme.light')}
                  </span>
                  {theme === 'light' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow'
                  }`}
                >
                  <Moon className={`h-8 w-8 mb-2 ${theme === 'dark' ? 'text-accent-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {t('settings.theme.dark')}
                  </span>
                  {theme === 'dark' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                {t('settings.theme.note')}
              </p>
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-primary-600" />
                {t('settings.language.title')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.language.subtitle')}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLanguage('en')}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    language === 'en' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow'
                  }`}
                >
                  <span className="text-3xl mb-2">🇬🇧</span>
                  <span className={`text-sm font-medium ${language === 'en' ? 'text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    English
                  </span>
                  {language === 'en' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setLanguage('fr')}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                    language === 'fr' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow'
                  }`}
                >
                  <span className="text-3xl mb-2">🇫🇷</span>
                  <span className={`text-sm font-medium ${language === 'fr' ? 'text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Français
                  </span>
                  {language === 'fr' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                {t('settings.language.note')}
              </p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                {notifications ? <Bell className="h-5 w-5 mr-2 text-primary-600" /> : <BellOff className="h-5 w-5 mr-2 text-gray-400" />}
                {t('settings.notifications.title')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.notifications.subtitle')}</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start">
                  {notifications ? (
                    <Bell className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  )}
                  <div>
                    <label htmlFor="notifications-toggle" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                      {t('settings.notifications.enable')}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('settings.notifications.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center ml-4">
                  <button
                    type="button"
                    id="notifications-toggle"
                    role="switch"
                    aria-checked={notifications}
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 ${
                      notifications ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {!notifications && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center">
                    <BellOff className="h-4 w-4 mr-2" />
                    {t('settings.notifications.disabled')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div>
              {hasUnsavedChanges && (
                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {t('settings.unsavedChanges')}
                </p>
              )}
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saving || !hasUnsavedChanges}
              className={`inline-flex items-center px-6 py-2.5 rounded-md text-white font-medium transition-colors ${
                saving || !hasUnsavedChanges
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-accent-500 hover:bg-accent-600 transition-colors shadow-sm hover:shadow'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('settings.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('settings.save')}
                </>
              )}
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>{t('common.info')}:</strong> {t('settings.tip')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

