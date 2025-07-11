import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MG</span>
              </div>
              <span className="text-xl font-bold">MikeGi</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Your one-stop platform for car rentals, house rentals, and food delivery services.
            </p>
            <div className="text-sm text-gray-400">
              <p className="mb-1">Owned by:</p>
              <p className="text-white font-medium">Michael Quaicoe & Gideon Owusu</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/rent-car" className="text-gray-300 hover:text-white transition-colors">
                  Rent a Car
                </a>
              </li>
              <li>
                <a href="/rent-house" className="text-gray-300 hover:text-white transition-colors">
                  Rent a House
                </a>
              </li>
              <li>
                <a href="/order-food" className="text-gray-300 hover:text-white transition-colors">
                  Order Food
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-300 hover:text-white transition-colors">
                  Register
                </a>
              </li>
            </ul>
          </div>

          {/* Developer Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Developer</h3>
            <div className="text-sm">
              <p className="text-gray-300 mb-2">Developed by:</p>
              <p className="text-white font-medium mb-3">Khompatek</p>
              <a
                href="https://wa.me/233243762748"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 sm:mb-0">
              © {new Date().getFullYear()} MikeGi. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>by Khompatek</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;