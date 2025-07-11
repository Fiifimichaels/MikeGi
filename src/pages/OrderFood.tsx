import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import PaymentModal from '../components/PaymentModal';
import { MikegiService, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const OrderFood: React.FC = () => {
  const [foods, setFoods] = useState<MikegiService[]>([]);
  const [selectedFood, setSelectedFood] = useState<MikegiService | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('mikegi_services')
        .select('*')
        .eq('category', 'food')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching food:', error);
      } else {
        setFoods(data || []);
      }
    } catch (error) {
      console.error('Error fetching food:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: MikegiService) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedFood(food);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Food</h1>
          <p className="text-xl text-gray-600">
            Delicious meals delivered to your doorstep
          </p>
        </div>

        {foods.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No food items available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {foods.map((food) => (
              <ServiceCard
                key={food.id}
                service={food}
                onSelect={handleSelectFood}
              />
            ))}
          </div>
        )}

        <PaymentModal
          service={selectedFood}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedFood(null);
          }}
        />
      </div>
    </div>
  );
};

export default OrderFood;