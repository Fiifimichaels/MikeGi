import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import PaymentModal from '../components/PaymentModal';
import { MikegiService, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const RentHouse: React.FC = () => {
  const [houses, setHouses] = useState<MikegiService[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<MikegiService | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('mikegi_services')
        .select('*')
        .eq('category', 'house')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching houses:', error);
      } else {
        setHouses(data || []);
      }
    } catch (error) {
      console.error('Error fetching houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHouse = (house: MikegiService) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedHouse(house);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading houses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rent a House</h1>
          <p className="text-xl text-gray-600">
            Find your perfect home away from home
          </p>
        </div>

        {houses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No houses available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {houses.map((house) => (
              <ServiceCard
                key={house.id}
                service={house}
                onSelect={handleSelectHouse}
              />
            ))}
          </div>
        )}

        <PaymentModal
          service={selectedHouse}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedHouse(null);
          }}
        />
      </div>
    </div>
  );
};

export default RentHouse;