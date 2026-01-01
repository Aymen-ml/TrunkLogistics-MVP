import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, ArrowLeft, CheckCircle, AlertCircle, XCircle, Scale, UserX, DollarSign } from 'lucide-react';

const TermsOfUse = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link 
            to="/" 
            className="inline-flex items-center text-white hover:text-purple-100 mb-6 transition"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('legal.terms.backToHome')}
          </Link>
          <div className="flex items-center mb-4">
            <FileText className="h-12 w-12 text-white mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">{t('legal.terms.title')}</h1>
          </div>
          <p className="text-xl text-purple-100">
            {t('legal.terms.lastUpdated')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
          
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {t('legal.terms.intro.paragraph1')}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('legal.terms.intro.paragraph2')}
            </p>
          </section>

          {/* Acceptance */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.acceptance.title')}</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.terms.acceptance.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('legal.terms.acceptance.items.age')}</li>
              <li>{t('legal.terms.acceptance.items.capacity')}</li>
              <li>{t('legal.terms.acceptance.items.comply')}</li>
              <li>{t('legal.terms.acceptance.items.accurate')}</li>
              <li>{t('legal.terms.acceptance.items.agree')}</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                <UserX className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.accounts.title')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.terms.accounts.registration.title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>{t('legal.terms.accounts.registration.items.required')}</li>
                  <li>{t('legal.terms.accounts.registration.items.confidentiality')}</li>
                  <li>{t('legal.terms.accounts.registration.items.notify')}</li>
                  <li>{t('legal.terms.accounts.registration.items.responsible')}</li>
                  <li>{t('legal.terms.accounts.registration.items.oneAccount')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.terms.accounts.types.title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>{t('legal.terms.accounts.types.customer.title')}:</strong> {t('legal.terms.accounts.types.customer.desc')}</li>
                  <li><strong>{t('legal.terms.accounts.types.provider.title')}:</strong> {t('legal.terms.accounts.types.provider.desc')}</li>
                  <li><strong>{t('legal.terms.accounts.types.admin.title')}:</strong> {t('legal.terms.accounts.types.admin.desc')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.terms.accounts.verification.title')}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t('legal.terms.accounts.verification.intro')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>{t('legal.terms.accounts.verification.items.documentation')}</li>
                  <li>{t('legal.terms.accounts.verification.items.vehicle')}</li>
                  <li>{t('legal.terms.accounts.verification.items.background')}</li>
                  <li>{t('legal.terms.accounts.verification.items.compliance')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Platform Use */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 mr-4">
                <Scale className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.use.title')}</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.terms.use.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('legal.terms.use.items.laws')}</li>
              <li>{t('legal.terms.use.items.rights')}</li>
              <li>{t('legal.terms.use.items.malicious')}</li>
              <li>{t('legal.terms.use.items.access')}</li>
              <li>{t('legal.terms.use.items.impersonate')}</li>
              <li>{t('legal.terms.use.items.harass')}</li>
              <li>{t('legal.terms.use.items.automated')}</li>
              <li>{t('legal.terms.use.items.manipulate')}</li>
              <li>{t('legal.terms.use.items.fraud')}</li>
            </ul>
          </section>

          {/* Bookings and Transactions */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mr-4">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.bookings.title')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.terms.bookings.process.title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>{t('legal.terms.bookings.process.items.search')}</li>
                  <li>{t('legal.terms.bookings.process.items.acceptance')}</li>
                  <li>{t('legal.terms.bookings.process.items.prices')}</li>
                  <li>{t('legal.terms.bookings.process.items.confirmations')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.terms.bookings.payment.title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>{t('legal.terms.bookings.payment.items.terms')}</li>
                  <li>{t('legal.terms.bookings.payment.items.facilitate')}</li>
                  <li>{t('legal.terms.bookings.payment.items.disclosed')}</li>
                  <li>{t('legal.terms.bookings.payment.items.taxes')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('legal.terms.bookings.cancellation.title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>{t('legal.terms.bookings.cancellation.items.policies')}</li>
                  <li>{t('legal.terms.bookings.cancellation.items.review')}</li>
                  <li>{t('legal.terms.bookings.cancellation.items.refunds')}</li>
                  <li>{t('legal.terms.bookings.cancellation.items.mediate')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Liability */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mr-4">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.liability.title')}</h2>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                {t('legal.terms.liability.important.title')}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {t('legal.terms.liability.important.desc')}
              </p>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                {t('legal.terms.liability.intermediary')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('legal.terms.liability.notItems.own')}</li>
                <li>{t('legal.terms.liability.notItems.employ')}</li>
                <li>{t('legal.terms.liability.notItems.guarantee')}</li>
                <li>{t('legal.terms.liability.notItems.assume')}</li>
              </ul>

              <p className="mt-4">
                {t('legal.terms.liability.notLiable')}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('legal.terms.liability.notLiableItems.indirect')}</li>
                <li>{t('legal.terms.liability.notLiableItems.loss')}</li>
                <li>{t('legal.terms.liability.notLiableItems.provider')}</li>
                <li>{t('legal.terms.liability.notLiableItems.cargo')}</li>
                <li>{t('legal.terms.liability.notLiableItems.service')}</li>
              </ul>

              <p className="mt-4">
                {t('legal.terms.liability.maxLiability')}
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms.indemnification.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.terms.indemnification.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('legal.terms.indemnification.items.violation')}</li>
              <li>{t('legal.terms.indemnification.items.use')}</li>
              <li>{t('legal.terms.indemnification.items.rights')}</li>
              <li>{t('legal.terms.indemnification.items.services')}</li>
            </ul>
          </section>

          {/* Prohibited Conduct */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mr-4">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.prohibited.title')}</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.terms.prohibited.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('legal.terms.prohibited.items.illegal')}</li>
              <li>{t('legal.terms.prohibited.items.circumvent')}</li>
              <li>{t('legal.terms.prohibited.items.fake')}</li>
              <li>{t('legal.terms.prohibited.items.scraping')}</li>
              <li>{t('legal.terms.prohibited.items.reverse')}</li>
              <li>{t('legal.terms.prohibited.items.discriminate')}</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms.termination.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.terms.termination.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('legal.terms.termination.items.violation')}</li>
              <li>{t('legal.terms.termination.items.fraudulent')}</li>
              <li>{t('legal.terms.termination.items.nonpayment')}</li>
              <li>{t('legal.terms.termination.items.misuse')}</li>
              <li>{t('legal.terms.termination.items.discretion')}</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              {t('legal.terms.termination.userTerminate')}
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms.changes.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.terms.changes.text')}
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms.governing.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.terms.governing.text')}
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms.dispute.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.terms.dispute.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>{t('legal.terms.dispute.items.contact')}</li>
              <li>{t('legal.terms.dispute.items.mediation')}</li>
              <li>{t('legal.terms.dispute.items.legal')}</li>
            </ul>
          </section>

          {/* Severability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms.severability.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t('legal.terms.severability.text')}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms.contact.title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('legal.terms.contact.intro')}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>{t('legal.terms.contact.email')}:</strong>{' '}
                <a href="mailto:legal@movelinker.me" className="text-blue-600 dark:text-blue-400 hover:underline">
                  legal@movelinker.me
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>{t('legal.terms.contact.support')}:</strong>{' '}
                <a href="mailto:support@movelinker.me" className="text-blue-600 dark:text-blue-400 hover:underline">
                  support@movelinker.me
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>{t('legal.terms.contact.phone')}:</strong>{' '}
                <a href="tel:+213779116522" className="text-blue-600 dark:text-blue-400 hover:underline">
                  +213 779 11 65 22
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>{t('legal.terms.contact.location')}:</strong> {t('legal.terms.contact.address')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
