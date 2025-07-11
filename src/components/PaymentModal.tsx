import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Loader } from 'lucide-react';
import { MikegiService, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PaymentModalProps {
  service: MikegiService | null;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ service, isOpen, onClose }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'mobile-money' | 'card'>('mobile-money');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !service || !user) return null;

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Create order in database first
      const { data: orderData, error: orderError } = await supabase
        .from('mikegi_orders')
        .insert({
          user_id: user.id,
          service_id: service.id,
          service_name: service.name,
          amount: service.price,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        throw new Error('Failed to create order');
      }

      // Process payment with Hubtel
      const paymentResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: service.price,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone,
          serviceName: service.name,
          orderId: orderData.id,
          paymentMethod: paymentMethod
        })
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // Update order status to paid
        const { error: updateError } = await supabase
          .from('mikegi_orders')
          .update({ 
            status: 'paid', 
            payment_reference: paymentResult.transactionId 
          })
          .eq('id', orderData.id);

        if (updateError) {
          throw new Error('Failed to update order status');
        }

        // Send notifications
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: user.name,
            customerEmail: user.email,
            customerPhone: user.phone,
            serviceName: service.name,
            amount: service.price,
            orderId: orderData.id
          })
        });

        // Redirect to thank you page
        window.location.href = '/thank-you';
      } else {
        throw new Error(paymentResult.message || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
          <p className="text-gray-600 mb-4">{service.description}</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">
                GH₵{service.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <h4 className="font-medium mb-3">Payment Method</h4>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="mobile-money"
                checked={paymentMethod === 'mobile-money'}
                onChange={(e) => setPaymentMethod(e.target.value as 'mobile-money')}
                className="text-blue-600"
                disabled={loading}
              />
              <Smartphone className="w-5 h-5 text-green-600" />
              <span>Mobile Money (MTN, Vodafone, AirtelTigo)</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                className="text-blue-600"
                disabled={loading}
              />
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Credit/Debit Card</span>
            </label>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-2 text-blue-700">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">Secure Payment by Hubtel</span>
          </div>
          <p className="text-blue-600 text-xs mt-1">
            You'll receive SMS and email confirmation after payment
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Pay with Hubtel</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;