import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, X, RefreshCw } from 'lucide-react';

const EmailVerificationBanner = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is verified or banner is dismissed
  if (!user || user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // TODO: Implement resend verification email API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Mail className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {t('common.emailVerificationBanner.title')}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {t('common.emailVerificationBanner.message')}
            </p>
          </div>
          <div className="mt-4">
            <div className="flex space-x-4">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="inline-flex items-center text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-600 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-1" />
                    {t('common.emailVerificationBanner.sending')}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-1" />
                    {t('common.emailVerificationBanner.resend')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setIsDismissed(true)}
              className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 dark:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
            >
              <span className="sr-only">{t('common.dismiss')}</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
