import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, Drone } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';

interface DataContextType {
  orders: Order[];
  drones: Drone[];
  addOrder: (order: Order) => Promise<void>;
  addDrone: (drone: Drone) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status'], ownerId?: string, ownerName?: string, ownerEmail?: string) => Promise<void>;
  updateDroneStatus: (id: string, status: Drone['status']) => Promise<void>;
  getStats: (role: 'customer' | 'owner') => any;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    let query = supabase.from('orders').select('*');

    // Filter by user role - customers only see their orders, owners see all
    if (user.role === 'customer') {
      query = query.eq('customer_id', user.id);
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching orders:', error);
    else if (data) {
      const mappedOrders: Order[] = data.map((o: any) => ({
        id: o.id,
        customerId: o.customer_id || o.customerId,
        ownerId: o.owner_id || o.ownerId,
        ownerName: o.owner_name || o.ownerName,
        ownerEmail: o.owner_email || o.ownerEmail,
        status: o.status,
        pickup: o.pickup,
        delivery: o.delivery,
        eta: o.eta,
        price: o.price,
        item: o.item,
        date: o.date,
        weight: o.weight,
        lengthCm: o.length_cm,
        widthCm: o.width_cm,
        heightCm: o.height_cm,
        senderName: o.sender_name,
        senderPhone: o.sender_phone,
        recipientName: o.recipient_name,
        recipientPhone: o.recipient_phone,
        fragile: o.fragile
      }));
      setOrders(mappedOrders.reverse()); // Newest first
    }
  };

  const fetchDrones = async () => {
    if (!user) {
      setDrones([]);
      return;
    }

    let query = supabase.from('drones').select('*');

    // Filter by owner - only owners see drones, and only their own
    if (user.role === 'owner') {
      query = query.eq('owner_id', user.id);
    } else {
      // Customers don't need to see drones
      setDrones([]);
      return;
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching drones:', error);
    else if (data) {
      const mappedDrones: Drone[] = data.map((d: any) => ({
        id: d.id,
        ownerId: d.owner_id || d.ownerId,
        model: d.model,
        status: d.status,
        battery: d.battery,
        flights: d.flights,
        hours: d.hours,
        lastMaintenance: d.last_maintenance || d.lastMaintenance,
        image: d.image
      }));
      setDrones(mappedDrones);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchOrders(), fetchDrones()]).then(() => setLoading(false));
    } else {
      setOrders([]);
      setDrones([]);
      setLoading(false);
    }
  }, [user?.id, user?.role]); // Re-fetch when user changes

  const addOrder = async (order: Order) => {
    console.log('Adding order:', order);
    // Optimistic update
    setOrders(prev => [order, ...prev]);

    // DB Insert
    const { data, error } = await supabase.from('orders').insert({
      id: order.id,
      customer_id: order.customerId,
      owner_id: order.ownerId,
      owner_name: order.ownerName,
      owner_email: order.ownerEmail,
      status: order.status,
      pickup: order.pickup,
      delivery: order.delivery,
      eta: order.eta,
      price: order.price,
      item: order.item,
      date: order.date,
      weight: order.weight,
      length_cm: order.lengthCm,
      width_cm: order.widthCm,
      height_cm: order.heightCm,
      sender_name: order.senderName,
      sender_phone: order.senderPhone,
      recipient_name: order.recipientName,
      recipient_phone: order.recipientPhone,
      fragile: order.fragile
    }).select();

    if (error) {
      console.error('Error adding order to Supabase:', error);
      // Revert optimistic update
      setOrders(prev => prev.filter(o => o.id !== order.id));
      alert(`Failed to save order: ${error.message}`);
    } else {
      console.log('Order added successfully:', data);
    }
  };

  const addDrone = async (drone: Drone) => {
    setDrones([...drones, drone]);

    // DB Insert
    const { error } = await supabase.from('drones').insert({
      id: drone.id,
      owner_id: drone.ownerId,
      model: drone.model,
      status: drone.status,
      battery: drone.battery,
      flights: drone.flights,
      hours: drone.hours,
      last_maintenance: drone.lastMaintenance,
      image: drone.image
    });

    if (error) {
      console.error('Error adding drone:', error);
      fetchDrones();
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status'], ownerId?: string, ownerName?: string, ownerEmail?: string) => {
    // Update local state
    setOrders(orders.map(o => {
      if (o.id === id) {
        return { ...o, status, ...(ownerId && { ownerId, ownerName, ownerEmail }) };
      }
      return o;
    }));

    // Prepare update object
    const updateData: any = { status };
    if (ownerId) {
      updateData.owner_id = ownerId;
      updateData.owner_name = ownerName;
      updateData.owner_email = ownerEmail;
    }

    const { error } = await supabase.from('orders').update(updateData).eq('id', id);
    if (error) console.error('Error updating order:', error);
  };

  const updateDroneStatus = async (id: string, status: Drone['status']) => {
    setDrones(drones.map(d => d.id === id ? { ...d, status } : d));

    const { error } = await supabase.from('drones').update({ status }).eq('id', id);
    if (error) console.error('Error updating drone:', error);
  };

  const getStats = (role: 'customer' | 'owner') => {
    if (role === 'customer') {
      // Orders are already filtered by customer_id in fetchOrders
      return {
        totalOrders: orders.length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        inTransit: orders.filter(o => o.status === 'in-transit').length,
        spent: orders.reduce((acc, curr) => acc + curr.price, 0)
      };
    } else {
      // For owners, orders are all orders (not filtered in fetchOrders)
      return {
        earnings: orders.filter(o => o.status === 'delivered').reduce((acc, curr) => acc + (curr.price * 0.8), 0),
        deliveries: orders.filter(o => o.status === 'delivered').length,
        flightHours: orders.length * 0.5,
        activeOrders: orders.filter(o => o.status === 'in-transit').length
      };
    }
  };

  return (
    <DataContext.Provider value={{ orders, drones, addOrder, addDrone, updateOrderStatus, updateDroneStatus, getStats, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};