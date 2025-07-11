import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MG</span>
              </div>
              <span className="text-xl font-bold">MikeGi</span>
            </div>
            <p className="text-gray-300 text-sm">
              Owned by Michael Quaicoe & Gideon Owusu
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center space-x-6 text-sm">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
              About Us
            </Link>
            <Link to="/rent-car" className="text-gray-300 hover:text-white transition-colors">
              Rent Car
            </Link>
            <Link to="/rent-house" className="text-gray-300 hover:text-white transition-colors">
              Rent House
            </Link>
            <Link to="/order-food" className="text-gray-300 hover:text-white transition-colors">
              Order Food
            </Link>
          </div>

          {/* Developer Info */}
          <div className="text-center md:text-right">
            <p className="text-gray-300 text-sm mb-2">Developed by Khompatek</p>
            <a
              href="https://wa.me/233243762748"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} MikeGi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;