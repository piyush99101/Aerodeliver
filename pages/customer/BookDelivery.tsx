import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../services/DataContext';
import { useAuth } from '../../services/AuthContext';

const BookDelivery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addOrder } = useData();
  const { user } = useAuth();

  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [item, setItem] = useState('');

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [weight, setWeight] = useState<string>('1');
  const [lengthCm, setLengthCm] = useState<string>('10');
  const [widthCm, setWidthCm] = useState<string>('10');
  const [fragile, setFragile] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const inputBase = 'w-full px-4 py-3 bg-white/8 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none placeholder:text-gray-400';
  const inputError = 'border-rose-500 ring-2 ring-rose-500';

  const spotlightRef = useRef<HTMLDivElement | null>(null);

  // Pre-fill form if reorder data is present
  useEffect(() => {
    const state = location.state as any;
    if (state?.reorderData) {
      const { pickup: p, delivery: d, item: i, weight: w, dimensions, contact } = state.reorderData;
      if (p) setPickup(p);
      if (d) setDelivery(d);
      if (i) setItem(i);
      if (w) setWeight(String(w));
      if (dimensions) {
        if (dimensions.length) setLengthCm(String(dimensions.length));
        if (dimensions.width) setWidthCm(String(dimensions.width));
      }
      if (contact) {
        if (contact.senderName) setSenderName(contact.senderName);
        if (contact.senderPhone) setSenderPhone(contact.senderPhone);
        if (contact.recipientName) setRecipientName(contact.recipientName);
        if (contact.recipientPhone) setRecipientPhone(contact.recipientPhone);
      }
    }
  }, [location]);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    const onMove = (ev: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', () => { el.style.setProperty('--mouse-x', `50%`); el.style.setProperty('--mouse-y', `50%`); });
    return () => {
      el.removeEventListener('mousemove', onMove);
    };
  }, []);

  const phoneIsValid = (p: string) => {
    if (!p) return false;
    // very simple validation: digits and length
    const digits = p.replace(/[^0-9]/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!pickup.trim()) e.pickup = 'Pickup address is required.';
    if (!delivery.trim()) e.delivery = 'Delivery address is required.';
    if (!senderName.trim()) e.senderName = 'Sender name is required.';
    if (!phoneIsValid(senderPhone)) e.senderPhone = 'Enter a valid phone number.';
    if (!recipientName.trim()) e.recipientName = 'Recipient name is required.';
    if (!phoneIsValid(recipientPhone)) e.recipientPhone = 'Enter a valid phone number.';
    const w = parseFloat(weight || '0');
    if (Number.isNaN(w) || w <= 0) e.weight = 'Enter a valid weight.';
    return e;
  };

  const computePrice = () => {
    const base = 50;
    const dist = 25; // placeholder distance fee
    const w = Math.max(0, Math.ceil((parseFloat(weight || '0') - 1))) * 10; // ₹10 per kg over 1kg
    return base + dist + w;
  };

  const handleBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length > 0) return;

    setLoading(true);
    const price = computePrice();

    // Helper to generate UUID
    const generateUUID = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const newOrder = {
      id: generateUUID(),
      customerId: user?.id,
      status: 'pending' as const,
      pickup: pickup.trim(),
      delivery: delivery.trim(),
      price,
      item: item || 'Package',
      date: new Date().toISOString(),
      eta: '15 mins',
      senderName: senderName.trim(),
      senderPhone: senderPhone.trim(),
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      weight: Number(weight),
      lengthCm: Number(lengthCm),
      widthCm: Number(widthCm),
      fragile,
    } as any;

    // simulate API latency
    try {
      await new Promise((res) => setTimeout(res, 600));
      addOrder(newOrder);
      setLoading(false);
      navigate('/customer/orders');
    } catch (err) {
      setLoading(false);
      setErrors({ form: 'Failed to create order. Try again.' });
    }
  };

  return (
    <div className="section bg-noise max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brand-dark mb-1">Book a Delivery</h1>
        <p className="text-brand-gray-500">Schedule your drone delivery in minutes.</p>
      </div>

      <form onSubmit={handleBook} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card p-8 rounded-2dot5rem">
            <div className="space-y-8">
              {/* Preview detail tiles (like MyOrders) */}
              <div ref={spotlightRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 spotlight-card">
                <div className="glass-card p-3 rounded-lg flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                    <svg className="w-4 h-4 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 11 6 11s6-6.582 6-11c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="8" r="1.6" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Pickup</div>
                    <div className="text-gray-500">{pickup || 'Not set'}</div>
                  </div>
                </div>

                <div className="glass-card p-3 rounded-lg flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-rose-500" />
                    <svg className="w-5 h-5 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" />
                      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Delivery</div>
                    <div className="text-gray-500">{delivery || 'Not set'}</div>
                  </div>
                </div>

                <div className="glass-card p-3 rounded-lg flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600" />
                    <svg className="w-5 h-5 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M7 7v-2h10v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 12h0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Item</div>
                    <div className="text-gray-500">{item || '—'}</div>
                  </div>
                </div>

                <div className="glass-card p-3 rounded-lg flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-600" />
                    <svg className="w-5 h-5 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">ETA</div>
                    <div className="text-gray-500">15 mins</div>
                  </div>
                </div>
              </div>
              {/* Pickup */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                    <svg className="w-4 h-4 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 11 6 11s6-6.582 6-11c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="8" r="1.6" fill="currentColor" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-brand-dark">Pickup Details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address</label>
                    <input
                      type="text"
                      required
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Enter pickup address"
                      className={`${inputBase} ${errors.pickup ? inputError : 'border border-white/20'}`}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                      <input id="senderName" name="senderName" value={senderName} onChange={(e) => setSenderName(e.target.value)} type="text" placeholder="Sender Name" className={`${inputBase} ${errors.senderName ? inputError : 'border border-white/20'}`} />
                      {errors.senderName && <div className="text-rose-600 text-sm mt-1">{errors.senderName}</div>}
                    </div>
                    <div>
                      <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input id="senderPhone" name="senderPhone" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} type="tel" placeholder="+1 (555) 000-0000" className={`${inputBase} ${errors.senderPhone ? inputError : 'border border-white/20'}`} />
                      {errors.senderPhone && <div className="text-rose-600 text-sm mt-1">{errors.senderPhone}</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/12"></div>

              {/* Delivery */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-rose-500" />
                    <svg className="w-5 h-5 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" />
                      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-brand-dark">Delivery Details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={delivery}
                      onChange={(e) => setDelivery(e.target.value)}
                      placeholder="Enter delivery address"
                      className={`${inputBase} ${errors.delivery ? inputError : 'border border-white/20'}`}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
                      <input id="recipientName" name="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} type="text" placeholder="Receiver Name" className={`${inputBase} ${errors.recipientName ? inputError : 'border border-white/20'}`} />
                      {errors.recipientName && <div className="text-rose-600 text-sm mt-1">{errors.recipientName}</div>}
                    </div>
                    <div>
                      <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input id="recipientPhone" name="recipientPhone" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} type="tel" placeholder="+1 (555) 000-0000" className={`${inputBase} ${errors.recipientPhone ? inputError : 'border border-white/20'}`} />
                      {errors.recipientPhone && <div className="text-rose-600 text-sm mt-1">{errors.recipientPhone}</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/12"></div>

              {/* Package */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600" />
                    <svg className="w-5 h-5 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M7 7v-2h10v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 12h0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-brand-dark">Package Info</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input id="weight" name="weight" value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" min="0" placeholder="Weight (kg)" className={`${inputBase} ${errors.weight ? inputError : 'border border-white/20'}`} />
                    {errors.weight && <div className="text-rose-600 text-sm mt-1">{errors.weight}</div>}
                  </div>
                  <div>
                    <label htmlFor="lengthCm" className="block text-sm font-medium text-gray-700 mb-2">Length (cm)</label>
                    <input id="lengthCm" name="lengthCm" value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} type="number" min="0" placeholder="Length (cm)" className="w-full px-4 py-3 bg-white/8 border border-white/20 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label htmlFor="widthCm" className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
                    <input id="widthCm" name="widthCm" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} type="number" min="0" placeholder="Width (cm)" className="w-full px-4 py-3 bg-white/8 border border-white/20 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none placeholder:text-gray-400" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Description</label>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    placeholder="E.g. Documents, Electronics"
                    className={`${inputBase} border border-white/20`}
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
                    <input id="fragile" name="fragile" checked={fragile} onChange={(e) => setFragile(e.target.checked)} type="checkbox" className="w-5 h-5 text-brand-blue rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-strong p-6 rounded-2xl sticky top-24">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Summary</h3>
            <div className="space-y-3 mb-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span className="font-semibold">₹50</span>
              </div>
              <div className="flex justify-between">
                <span>Distance (estimated)</span>
                <span className="font-semibold">₹25</span>
              </div>
              <div className="flex justify-between">
                <span>Weight Fee</span>
                <span className="font-semibold">₹{Math.max(0, Math.ceil((parseFloat(weight || '0') - 1))) * 10}</span>
              </div>
            </div>
            <div className="h-px bg-white/12 mb-4"></div>
            <div className="flex flex-col gap-2 items-start mb-4">
              <div className="flex justify-between w-full">
                <span className="text-lg font-bold text-brand-dark">Total</span>
                <span className="text-2xl font-bold text-brand-blue">₹{computePrice()}</span>
              </div>
              <div className="text-xs text-gray-500">Estimated arrival: <span className="font-medium">15 mins</span></div>
            </div>
            {errors.form && <div className="text-rose-600 mb-3">{errors.form}</div>}
            <button type="submit" disabled={loading} className="w-full primary-btn flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" /><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span className="whitespace-nowrap">Confirm & Pay — ₹{computePrice()}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookDelivery;