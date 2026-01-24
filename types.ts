export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'owner';
  avatar?: string;
}

export interface Drone {
  id: string;
  ownerId: string;
  model: string;
  status: 'active' | 'charging' | 'maintenance' | 'offline';
  battery: number;
  flights: number;
  hours: number;
  lastMaintenance: string;
  image: string;
}

export interface Order {
  id: string;
  customerId?: string;
  ownerId?: string; // ID of owner who accepted this order
  ownerName?: string; // Name of owner for display
  ownerEmail?: string; // Email of owner for contact
  status: 'pending' | 'in-transit' | 'delivered';
  pickup: string;
  delivery: string;
  eta?: string;
  price: number;
  item: string;
  date: string;
  weight?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  senderName?: string;
  senderPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  fragile?: boolean;
  distance?: string;
  fee?: string;
  durationMinutes?: number;
}

export interface Stats {
  totalOrders: number;
  delivered: number;
  inTransit: number;
  spent: number;
}