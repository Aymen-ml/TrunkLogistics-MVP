import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, ArrowLeft, Lock, Eye, Database, UserCheck, Bell, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link 
            to="/" 
            className="inline-flex items-center text-white hover:text-blue-100 mb-6 transition"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center mb-4">
            <Shield className="h-12 w-12 text-white mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-xl text-blue-100">
            Last updated: October 27, 2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
          
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              At movelinker, we are committed to protecting your privacy and ensuring the security of your personal 
              information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our platform.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              By using movelinker, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  We collect information that you provide directly to us when you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Create an account (name, email address, phone number, password)</li>
                  <li>Complete your profile (business information, address)</li>
                  <li>Submit verification documents (for providers)</li>
                  <li>Create bookings or list trucks</li>
                  <li>Contact our support team</li>
                  <li>Subscribe to notifications or newsletters</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Automatically Collected Information</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  When you use our platform, we automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, clicks)</li>
                  <li>Location data (if you grant permission)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 mr-4">
                <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How We Use Your Information</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>To provide and maintain our service</li>
              <li>To process and manage bookings</li>
              <li>To verify provider credentials and ensure platform safety</li>
              <li>To send you important notifications about your bookings and account</li>
              <li>To improve our platform and user experience</li>
              <li>To provide customer support</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
              <li>To send marketing communications (with your consent)</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mr-4">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Information Sharing and Disclosure</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>With Other Users:</strong> When you create a booking, necessary information is shared with the provider (and vice versa)</li>
              <li><strong>Service Providers:</strong> We may share information with third-party service providers who help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> We may share information for other purposes with your explicit consent</li>
            </ul>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> We never sell your personal information to third parties for marketing purposes.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mr-4">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Security</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and password protection</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and employee training</li>
              <li>Secure cloud infrastructure with industry-leading providers</li>
            </ul>
            
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your 
              information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mr-4">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Rights</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
            </ul>
            
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:privacy@movelinker.me" className="text-blue-600 dark:text-blue-400 hover:underline">
                privacy@movelinker.me
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3 mr-4">
                <Bell className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cookies and Tracking</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use cookies and similar tracking technologies to enhance your experience. You can control cookies through 
              your browser settings. However, disabling cookies may limit your ability to use certain features of our platform.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Children's Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our service is not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us 
              immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@movelinker.me" className="text-blue-600 dark:text-blue-400 hover:underline">
                  privacy@movelinker.me
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Phone:</strong>{' '}
                <a href="tel:+213779116522" className="text-blue-600 dark:text-blue-400 hover:underline">
                  +213 779 11 65 22
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Location:</strong> Algiers, Algeria
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
