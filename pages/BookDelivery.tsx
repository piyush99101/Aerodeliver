import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../services/DataContext';

const BookDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { addOrder } = useData();

  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [item, setItem] = useState('');

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new order
    const newOrder = {
      id: `SK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'in-transit' as const, // Automatically set to in-transit for demo
      pickup: pickup || 'Unknown Location',
      delivery: delivery || 'Unknown Destination',
      price: 85,
      item: item || 'Package',
      date: new Date().toISOString(),
      eta: '5 mins'
    };

    addOrder(newOrder);

    // Navigate to dashboard
    navigate('/customer/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Book a Delivery</h1>
        <p className="text-brand-gray-500">Schedule your drone delivery in minutes.</p>
      </div>

      <form onSubmit={handleBook} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-200 p-8">
            <div className="space-y-8">
              {/* Pickup */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-1 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                      <svg className="w-4 h-4 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 11 6 11s6-6.582 6-11c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="8" r="1.6" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark">Pickup Details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Address</label>
                    <input
                      type="text"
                      required
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Enter pickup address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
                      <input type="text" placeholder="Sender Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Delivery */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-1 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-rose-500" />
                      <svg className="w-4 h-4 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark">Delivery Details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={delivery}
                      onChange={(e) => setDelivery(e.target.value)}
                      placeholder="Enter delivery address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Name</label>
                      <input type="text" placeholder="Receiver Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Package */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-1 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600" />
                      <svg className="w-4 h-4 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M7 7v-2h10v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark">Package Info</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <input type="number" placeholder="Weight (kg)" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                  <input type="number" placeholder="Length (cm)" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                  <input type="number" placeholder="Width (cm)" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Item Description</label>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    placeholder="E.g. Documents, Electronics"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
                <div className="glass-card p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400" />
                      <svg className="w-4 h-4 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 3H16M3 8V16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 12h10M7 16h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-800">Fragile Item</div>
                      <div className="text-gray-500">Requires extra care</div>
                    </div>
                  </div>
                  <div>
                    <input type="checkbox" className="w-5 h-5 text-brand-blue rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-200 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-brand-dark mb-6">Summary</h3>
            <div className="space-y-4 mb-6 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span className="font-semibold">₹50</span>
              </div>
              <div className="flex justify-between">
                <span>Distance (2.5 km)</span>
                <span className="font-semibold">₹25</span>
              </div>
              <div className="flex justify-between">
                <span>Weight Fee</span>
                <span className="font-semibold">₹10</span>
              </div>
            </div>
            <div className="h-px bg-gray-200 mb-4"></div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-brand-dark">Total</span>
              <span className="text-2xl font-bold text-brand-blue">₹85</span>
            </div>
            <button type="submit" className="w-full bg-brand-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200">
              Confirm & Pay
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookDelivery;