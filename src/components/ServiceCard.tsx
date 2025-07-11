import React from 'react';
import { MikegiService } from '../lib/supabase';

interface ServiceCardProps {
  service: MikegiService;
  onSelect: (service: MikegiService) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400`;
          }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            GH₵{service.price.toFixed(2)}
          </span>
          <button
            onClick={() => onSelect(service)}
            disabled={!service.available}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              service.available
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {service.available ? 'Select' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;