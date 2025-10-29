import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, CheckCircle, AlertCircle, XCircle, Scale, UserX, DollarSign } from 'lucide-react';

const TermsOfUse = () => {
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
            Back to Home
          </Link>
          <div className="flex items-center mb-4">
            <FileText className="h-12 w-12 text-white mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Terms of Use</h1>
          </div>
          <p className="text-xl text-purple-100">
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
              Welcome to TruckLogistics. These Terms of Use ("Terms") govern your access to and use of our platform, 
              services, and features. By accessing or using TruckLogistics, you agree to be bound by these Terms.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Please read these Terms carefully before using our platform. If you do not agree with these Terms, 
              you must not use our services.
            </p>
          </section>

          {/* Acceptance */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acceptance of Terms</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By creating an account, accessing, or using TruckLogistics, you confirm that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into binding agreements</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>All information you provide is accurate and complete</li>
              <li>You agree to these Terms and our Privacy Policy</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                <UserX className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Accounts</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Account Registration</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>You must register for an account to use certain features</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You agree to notify us immediately of any unauthorized access</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>One person or entity may not maintain more than one account without our permission</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Account Types</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>Customer Accounts:</strong> For businesses and individuals seeking transportation services</li>
                  <li><strong>Provider Accounts:</strong> For truck owners and logistics companies offering services</li>
                  <li><strong>Admin Accounts:</strong> For platform administrators and support staff</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Provider Verification</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Providers must complete our verification process, which includes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Submission of valid business documentation</li>
                  <li>Verification of vehicle registration and insurance</li>
                  <li>Background checks as required by law</li>
                  <li>Compliance with safety standards</li>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Permitted Use</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree to use TruckLogistics only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use automated systems to access the platform without permission</li>
              <li>Manipulate reviews, ratings, or platform metrics</li>
              <li>Engage in fraudulent activities or money laundering</li>
            </ul>
          </section>

          {/* Bookings and Transactions */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 mr-4">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings and Transactions</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Booking Process</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Customers can search for and book available trucks through the platform</li>
                  <li>All bookings are subject to provider acceptance</li>
                  <li>Prices are determined by providers and displayed clearly before booking</li>
                  <li>Booking confirmations are sent via email and platform notifications</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Payment Terms</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Payment terms are agreed upon between customers and providers</li>
                  <li>TruckLogistics may facilitate payment processing (where applicable)</li>
                  <li>All fees and charges will be clearly disclosed before transaction completion</li>
                  <li>Customers are responsible for any applicable taxes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Cancellations and Refunds</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Cancellation policies are set by individual providers</li>
                  <li>Customers should review cancellation terms before booking</li>
                  <li>Refunds are subject to provider policies and applicable laws</li>
                  <li>TruckLogistics may mediate disputes but is not responsible for refund decisions</li>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Limitation of Liability</h2>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                IMPORTANT: Please read this section carefully.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                This section limits our liability to you and affects your legal rights.
              </p>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                TruckLogistics acts as an intermediary platform connecting customers with providers. We do not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Own, operate, or control the trucks or transportation services</li>
                <li>Employ or directly contract with providers</li>
                <li>Guarantee the quality, safety, or legality of services provided</li>
                <li>Assume liability for damages, losses, or injuries during transportation</li>
              </ul>

              <p className="mt-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRUCKLOGISTICS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Damages arising from provider actions or omissions</li>
                <li>Damages resulting from cargo loss, damage, or delay</li>
                <li>Service interruptions or technical failures</li>
              </ul>

              <p className="mt-4">
                Our total liability for any claims shall not exceed the fees paid by you to TruckLogistics in the 
                12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Indemnification</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree to indemnify, defend, and hold harmless TruckLogistics, its officers, directors, employees, 
              and agents from any claims, liabilities, damages, losses, and expenses arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Your violation of these Terms</li>
              <li>Your use of the platform</li>
              <li>Your violation of any rights of another party</li>
              <li>Your provision or use of transportation services</li>
            </ul>
          </section>

          {/* Prohibited Conduct */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mr-4">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prohibited Conduct</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The following activities are strictly prohibited:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Transportation of illegal, hazardous, or prohibited materials</li>
              <li>Circumventing the platform to conduct direct transactions</li>
              <li>Creating fake accounts or reviews</li>
              <li>Scraping or collecting user data</li>
              <li>Reverse engineering or copying our platform</li>
              <li>Discriminating against users based on protected characteristics</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Termination</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to suspend or terminate your account at any time, with or without notice, for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Misuse of the platform</li>
              <li>At our sole discretion for any reason</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              You may terminate your account at any time by contacting our support team.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may modify these Terms at any time. We will notify you of material changes via email or platform 
              notification. Your continued use of the platform after changes constitute acceptance of the modified Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms shall be governed by and construed in accordance with the laws of Algeria. Any disputes 
              arising from these Terms or your use of the platform shall be subject to the exclusive jurisdiction 
              of the courts of Algiers, Algeria.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dispute Resolution</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              In the event of a dispute:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Contact our support team to attempt informal resolution</li>
              <li>If unresolved, parties agree to mediation before pursuing legal action</li>
              <li>Legal proceedings must be filed within one year of the dispute arising</li>
            </ul>
          </section>

          {/* Severability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Severability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
              limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in 
              full force and effect.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Use, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:legal@trucklogistics.me" className="text-blue-600 dark:text-blue-400 hover:underline">
                  legal@trucklogistics.me
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Support:</strong>{' '}
                <a href="mailto:support@trucklogistics.me" className="text-blue-600 dark:text-blue-400 hover:underline">
                  support@trucklogistics.me
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

export default TermsOfUse;
