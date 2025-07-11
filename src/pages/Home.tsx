import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Home as HomeIcon, UtensilsCrossed, Star, Users, Shield } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-yellow-300">MikeGi</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your one-stop platform for car rentals, house rentals, and food delivery
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Everything you need, all in one place</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link
              to="/rent-car"
              className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rent a Car</h3>
              <p className="text-gray-600 mb-6">
                Choose from our wide selection of vehicles for your transportation needs
              </p>
              <div className="text-blue-600 font-semibold group-hover:text-blue-700">
                Explore Cars →
              </div>
            </Link>

            <Link
              to="/rent-house"
              className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <HomeIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rent a House</h3>
              <p className="text-gray-600 mb-6">
                Find the perfect accommodation for your stay, from apartments to villas
              </p>
              <div className="text-green-600 font-semibold group-hover:text-green-700">
                Browse Houses →
              </div>
            </Link>

            <Link
              to="/order-food"
              className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
                <UtensilsCrossed className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Food</h3>
              <p className="text-gray-600 mb-6">
                Delicious meals delivered right to your doorstep from local restaurants
              </p>
              <div className="text-orange-600 font-semibold group-hover:text-orange-700">
                Order Now →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MikeGi?</h2>
            <p className="text-xl text-gray-600">We're committed to providing the best service</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Service</h3>
              <p className="text-gray-600">
                We ensure all our services meet the highest standards of quality and reliability
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Support</h3>
              <p className="text-gray-600">
                Our customer support team is available round the clock to assist you
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Payments</h3>
              <p className="text-gray-600">
                All transactions are secured with industry-standard encryption and security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who trust MikeGi for their needs
          </p>
          <Link
            to="/register"
            className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;