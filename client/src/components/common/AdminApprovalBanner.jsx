import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Shield, AlertCircle } from 'lucide-react';

const AdminApprovalBanner = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Only show for providers who are email verified but not admin approved
  if (!user || user.role !== 'provider' || !user.emailVerified || user.isVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <Clock className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {t('common.adminApprovalBanner.title')}
            </h3>
            <Shield className="h-4 w-4 text-yellow-600 ml-2" />
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {t('common.adminApprovalBanner.message')}
            </p>
          </div>
          <div className="mt-3 flex items-center text-xs text-yellow-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>{t('common.adminApprovalBanner.limitedFeatures')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalBanner;
