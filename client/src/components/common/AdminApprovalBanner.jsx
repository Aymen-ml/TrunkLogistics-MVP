import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Shield, AlertCircle } from 'lucide-react';

const AdminApprovalBanner = () => {
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
              Account Pending Admin Approval
            </h3>
            <Shield className="h-4 w-4 text-yellow-600 ml-2" />
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Your email has been verified successfully! Your provider account is now pending admin approval. 
              You will receive a notification once your account has been reviewed and approved by our team.
            </p>
          </div>
          <div className="mt-3 flex items-center text-xs text-yellow-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Some features may be limited until approval is complete.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalBanner;
