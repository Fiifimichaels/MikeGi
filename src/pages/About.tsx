import React from 'react';
import { Users, Target, Award, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About MikeGi</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Your trusted multi-service platform connecting you to car rentals, house rentals, and food delivery services
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Our Story</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              MikeGi was founded with a simple vision: to create a unified platform that makes essential services 
              easily accessible to everyone. We recognized the need for a reliable, user-friendly solution that 
              brings together transportation, accommodation, and food services under one roof.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Today, we're proud to serve our community by connecting customers with quality service providers, 
              ensuring convenience, reliability, and satisfaction in every transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Customer First</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We prioritize our customers' needs and satisfaction in every service we provide.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Reliability</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We ensure consistent, dependable service that our customers can trust.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quality</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We maintain high standards across all our services and partnerships.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Community</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We're committed to supporting and strengthening our local community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Leadership</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Meet the visionaries behind MikeGi</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">MQ</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Michael Quaicoe</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Co-Founder & CEO</p>
              <p className="text-gray-600 dark:text-gray-300">
                Visionary leader with a passion for innovation and customer service excellence.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">GO</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gideon Owusu</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">Co-Founder & CTO</p>
              <p className="text-gray-600 dark:text-gray-300">
                Technology expert focused on building scalable solutions and seamless user experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Development Credit */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white py-12">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-4">Platform Development</h2>
          <p className="text-blue-100 mb-6">
            This platform was expertly developed by Khompatek, bringing cutting-edge technology 
            and user-centered design to create the MikeGi experience.
          </p>
          <a
            href="https://wa.me/233243762748"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <span>Contact Developer on WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;