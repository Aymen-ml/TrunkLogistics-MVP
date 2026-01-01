import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Truck, Target, Users, Award, Shield, TrendingUp, ArrowLeft, MapPin, Package, CheckCircle } from 'lucide-react';

const AboutUs = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link 
            to="/" 
            className="inline-flex items-center text-white hover:text-orange-100 mb-6 transition"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('legal.backToHome')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('legal.about.title')}</h1>
          <p className="text-xl text-orange-100 max-w-3xl">
            {t('legal.about.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 mr-4">
                <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('legal.about.mission.title')}</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {t('legal.about.mission.description1')}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('legal.about.mission.description2')}
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('legal.about.whatWeDo.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 w-fit mb-4">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.about.whatWeDo.transport.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('legal.about.whatWeDo.transport.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 w-fit mb-4">
                <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.about.whatWeDo.fleet.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('legal.about.whatWeDo.fleet.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 w-fit mb-4">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('legal.about.whatWeDo.platform.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('legal.about.whatWeDo.platform.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('legal.about.whyChoose.title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 w-fit mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">{t('legal.about.whyChoose.verified.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                {t('legal.about.whyChoose.verified.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">{t('legal.about.whyChoose.transparent.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                {t('legal.about.whyChoose.transparent.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 w-fit mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">{t('legal.about.whyChoose.reliable.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                {t('legal.about.whyChoose.reliable.description')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">{t('legal.about.whyChoose.growth.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                {t('legal.about.whyChoose.growth.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Commitment */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 mr-4 shadow-md">
                <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('legal.about.commitment.title')}</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('legal.about.commitment.description')}
            </p>
          </div>
        </section>

        {/* Contact CTA */}
        <section>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-4">{t('legal.about.contact.title')}</h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              {t('legal.about.contact.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+213779116522"
                className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                {t('legal.contactInfo.phone')}: +213 779 11 65 22
              </a>
              <a
                href="mailto:support@movelinker.me"
                className="px-8 py-4 bg-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                {t('legal.contactInfo.email')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
