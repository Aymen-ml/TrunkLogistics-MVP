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
            {t('legal.privacy.backToHome')}
          </Link>
          <div className="flex items-center mb-4">
            <Shield className="h-12 w-12 text-white mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">{t('legal.privacy.title')}</h1>
          </div>
          <p className="text-xl text-blue-100">
            {t('legal.privacy.lastUpdated')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
          
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {t('legal.privacy.intro.paragraph1')}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('legal.privacy.intro.paragraph2')}
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.collect.title')}</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.privacy.collect.personal.title')}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t('legal.privacy.collect.personal.intro')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>{t('legal.privacy.collect.personal.items.account')}</li>
                  <li>{t('legal.privacy.collect.personal.items.profile')}</li>
                  <li>{t('legal.privacy.collect.personal.items.verification')}</li>
                  <li>{t('legal.privacy.collect.personal.items.bookings')}</li>
                  <li>{t('legal.privacy.collect.personal.items.support')}</li>
                  <li>{t('legal.privacy.collect.personal.items.subscribe')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.privacy.collect.auto.title')}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t('legal.privacy.collect.auto.intro')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>{t('legal.privacy.collect.auto.items.device')}</li>
                  <li>{t('legal.privacy.collect.auto.items.usage')}</li>
                  <li>{t('legal.privacy.collect.auto.items.location')}</li>
                  <li>{t('legal.privacy.collect.auto.items.cookies')}</li>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.use.title')}</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.privacy.use.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('legal.privacy.use.items.provide')}</li>
              <li>{t('legal.privacy.use.items.process')}</li>
              <li>{t('legal.privacy.use.items.verify')}</li>
              <li>{t('legal.privacy.use.items.notifications')}</li>
              <li>{t('legal.privacy.use.items.improve')}</li>
              <li>{t('legal.privacy.use.items.support')}</li>
              <li>{t('legal.privacy.use.items.fraud')}</li>
              <li>{t('legal.privacy.use.items.legal')}</li>
              <li>{t('legal.privacy.use.items.marketing')}</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mr-4">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.sharing.title')}</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.privacy.sharing.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>{t('legal.privacy.sharing.items.users.title')}:</strong> {t('legal.privacy.sharing.items.users.desc')}</li>
              <li><strong>{t('legal.privacy.sharing.items.providers.title')}:</strong> {t('legal.privacy.sharing.items.providers.desc')}</li>
              <li><strong>{t('legal.privacy.sharing.items.legal.title')}:</strong> {t('legal.privacy.sharing.items.legal.desc')}</li>
              <li><strong>{t('legal.privacy.sharing.items.business.title')}:</strong> {t('legal.privacy.sharing.items.business.desc')}</li>
              <li><strong>{t('legal.privacy.sharing.items.consent.title')}:</strong> {t('legal.privacy.sharing.items.consent.desc')}</li>
            </ul>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>{t('legal.privacy.sharing.note.title')}:</strong> {t('legal.privacy.sharing.note.desc')}
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mr-4">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.security.title')}</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.privacy.security.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('legal.privacy.security.items.encryption')}</li>
              <li>{t('legal.privacy.security.items.authentication')}</li>
              <li>{t('legal.privacy.security.items.audits')}</li>
              <li>{t('legal.privacy.security.items.access')}</li>
              <li>{t('legal.privacy.security.items.cloud')}</li>
            </ul>
            
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              {t('legal.privacy.security.disclaimer')}
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mr-4">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.rights.title')}</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.privacy.rights.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>{t('legal.privacy.rights.items.access.title')}:</strong> {t('legal.privacy.rights.items.access.desc')}</li>
              <li><strong>{t('legal.privacy.rights.items.correction.title')}:</strong> {t('legal.privacy.rights.items.correction.desc')}</li>
              <li><strong>{t('legal.privacy.rights.items.deletion.title')}:</strong> {t('legal.privacy.rights.items.deletion.desc')}</li>
              <li><strong>{t('legal.privacy.rights.items.portability.title')}:</strong> {t('legal.privacy.rights.items.portability.desc')}</li>
              <li><strong>{t('legal.privacy.rights.items.optout.title')}:</strong> {t('legal.privacy.rights.items.optout.desc')}</li>
              <li><strong>{t('legal.privacy.rights.items.withdraw.title')}:</strong> {t('legal.privacy.rights.items.withdraw.desc')}</li>
            </ul>
            
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              {t('legal.privacy.rights.contact')}{' '}
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.cookies.title')}</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.privacy.cookies.text')}
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.privacy.children.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.privacy.children.text')}
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.privacy.changes.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.privacy.changes.text')}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.privacy.contact.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.privacy.contact.intro')}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>{t('legal.privacy.contact.email')}:</strong>{' '}
                <a href="mailto:privacy@movelinker.me" className="text-blue-600 dark:text-blue-400 hover:underline">
                  privacy@movelinker.me
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>{t('legal.privacy.contact.phone')}:</strong>{' '}
                <a href="tel:+213779116522" className="text-blue-600 dark:text-blue-400 hover:underline">
                  +213 779 11 65 22
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>{t('legal.privacy.contact.location')}:</strong> {t('legal.privacy.contact.address')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
