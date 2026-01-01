import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cookie, ArrowLeft, Shield, Eye, Settings, AlertCircle } from 'lucide-react';

const CookiePolicy = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 dark:from-amber-700 dark:to-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link 
            to="/" 
            className="inline-flex items-center text-white hover:text-amber-100 mb-6 transition"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('legal.backToHome')}
          </Link>
          <div className="flex items-center mb-4">
            <Cookie className="h-12 w-12 text-white mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">{t('legal.cookie.title')}</h1>
          </div>
          <p className="text-xl text-amber-100">
            {t('legal.lastUpdated')}: {t('legal.cookie.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
          
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('legal.cookie.intro')}
            </p>
          </section>

          {/* What Are Cookies */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 mr-4">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.cookie.what.title')}</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('legal.cookie.what.description')}
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('legal.cookie.types.title')}</h2>
            
            {/* Essential Cookies */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.cookie.types.essential.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{t('legal.cookie.types.essential.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                {t('legal.cookie.types.essential.list', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic">{t('legal.cookie.types.essential.note')}</p>
            </div>

            {/* Performance Cookies */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.cookie.types.performance.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{t('legal.cookie.types.performance.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                {t('legal.cookie.types.performance.list', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Functional Cookies */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.cookie.types.functional.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{t('legal.cookie.types.functional.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                {t('legal.cookie.types.functional.list', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Targeting Cookies */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.cookie.types.targeting.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{t('legal.cookie.types.targeting.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                {t('legal.cookie.types.targeting.list', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.cookie.thirdParty.title')}</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-3">{t('legal.cookie.thirdParty.description')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              {t('legal.cookie.thirdParty.list', { returnObjects: true }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic">{t('legal.cookie.thirdParty.note')}</p>
          </section>

          {/* How to Control Cookies */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mr-4">
                <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.cookie.control.title')}</h2>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.cookie.control.browser.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{t('legal.cookie.control.browser.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                {t('legal.cookie.control.browser.list', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic">{t('legal.cookie.control.browser.note')}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.cookie.control.preferences.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{t('legal.cookie.control.preferences.description')}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                {t('legal.cookie.control.preferences.list', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Do Not Track */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.cookie.doNotTrack.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('legal.cookie.doNotTrack.description')}
            </p>
          </section>

          {/* Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.cookie.updates.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('legal.cookie.updates.description')}
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.cookie.contact.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.cookie.contact.description')}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{t('legal.contactInfo.email')}:</span>{' '}
                  <a href="mailto:support@movelinker.me" className="text-amber-600 dark:text-amber-400 hover:underline">
                    support@movelinker.me
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{t('legal.contactInfo.phone')}:</span>{' '}
                  <a href="tel:+213779116522" className="text-amber-600 dark:text-amber-400 hover:underline">
                    +213 779 11 65 22
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{t('legal.contactInfo.location')}:</span> Algiers, Algeria
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
