import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, Mail, MessageSquare, Smartphone } from 'lucide-react';

const ThankYou: React.FC = () => {
  const [orderDetails, setOrderDetails] = useState({
    orderId: `MG${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString()
  });

  useEffect(() => {
    // Simulate order confirmation process
    const timer = setTimeout(() => {
      console.log('✅ Order confirmed and notifications sent');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for choosing MikeGi! Your payment has been processed successfully through Hubtel.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-6 text-sm text-blue-700 mb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email sent</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>SMS sent</span>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Smartphone className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by Hubtel</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Order ID:</span> #{orderDetails.orderId}</p>
              <p><span className="font-medium">Date:</span> {orderDetails.timestamp}</p>
              <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Confirmed</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Need help? Contact our support team</p>
              <p className="font-medium">support@mikegi.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;