import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Target, Users, Award, Shield, TrendingUp, ArrowLeft, MapPin, Package, CheckCircle } from 'lucide-react';

const AboutUs = () => {
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
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Us</h1>
          <p className="text-xl text-orange-100 max-w-3xl">
            Connecting businesses with trusted logistics providers across South Algeria
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              TruckLogistics is dedicated to revolutionizing the logistics industry in South Algeria by creating a seamless, 
              transparent, and efficient platform that connects businesses with verified truck providers. We believe in empowering 
              both customers and providers through technology, making logistics accessible, reliable, and growth-oriented.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Our platform bridges the gap between supply and demand, ensuring that every shipment reaches its destination 
              safely and on time while providing providers with the tools they need to grow their business.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 w-fit mb-4">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Connect Businesses</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We connect businesses of all sizes with verified truck providers, making it easy to find and book 
                transportation services for any cargo.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 w-fit mb-4">
                <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Ensure Trust & Safety</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every provider on our platform is thoroughly verified. We conduct background checks and document 
                verification to ensure safety and reliability.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 w-fit mb-4">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Drive Growth</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We provide providers with tools and analytics to manage their fleet efficiently, track performance, 
                and grow their business sustainably.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 mr-4 shadow-md">
                <MapPin className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Story</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Founded in Algeria, TruckLogistics was born out of a simple observation: the logistics industry in South 
              Algeria needed a modern, digital solution that could bring transparency, efficiency, and trust to freight 
              transportation.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We started with a vision to create a platform where businesses could easily find reliable truck providers, 
              and where providers could access a steady stream of customers while managing their operations more effectively.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              As we prepare to launch, we're building a platform designed to transform logistics in Algeria. Our goal is to 
              connect businesses with verified truck providers, streamline operations, and set new standards for transparency 
              and efficiency in the freight transportation industry.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ambition</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We constantly strive to innovate and push boundaries in the logistics industry.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-4 w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Transparency & Trust</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Open communication and complete transparency are the foundation of our platform.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-4 w-fit mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Quality</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We are committed to delivering services of the highest quality at every touchpoint.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg p-4 w-fit mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Performance</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We ensure optimal performance in every aspect of our operations and service delivery.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Have questions or want to learn more about how TruckLogistics can help your business?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+213779116522"
                className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Call Us: +213 779 11 65 22
              </a>
              <a
                href="mailto:support@trucklogistics.me"
                className="px-8 py-4 bg-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
