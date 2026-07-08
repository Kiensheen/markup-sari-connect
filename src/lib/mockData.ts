// Single source of truth for all mock data -- no backend, no Supabase.

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  wholesale_price: number;
  category: string | null;
  image_url: string | null;
  stock: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  consumer_id: string;
  rider_id: string | null;
  status: 'pending' | 'confirmed' | 'assigned' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'delivery_failed';
  total: number;
  delivery_fee: number;
  payment_method: string;
  delivery_address: string | null;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  delivery_failure_reason?: string | null;
  delivery_failure_notes?: string | null;
  delivery_failure_at?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'consumer' | 'rider' | 'admin';
  phone: string;
  address: string;
  points: number;
  avatar_url: string | null;
  is_blocked?: boolean;
  blocked_until?: string | null;
  created_at?: string;
}

export interface RiderStats {
  total_deliveries: number;
  total_earnings: number;
  rating: number;
}

export interface AdminStats {
  total_orders: number;
  total_revenue: number;
  total_consumers: number;
  total_riders: number;
  total_products: number;
  pending_orders: number;
  orders_today: number;
  revenue_today: number;
}

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Coca-Cola 1.5L', description: 'Classic soft drink', price: 75, wholesale_price: 65, category: 'Soft Drinks', image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200', stock: 50 },
  { id: 'p2', name: 'Pepsi 1.5L', description: null, price: 70, wholesale_price: 60, category: 'Soft Drinks', image_url: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=200', stock: 45 },
  { id: 'p3', name: 'San Miguel Beer', description: null, price: 55, wholesale_price: 45, category: 'Soft Drinks', image_url: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=200', stock: 100 },
  { id: 'p4', name: 'Lucky Me! Noodles', description: null, price: 18, wholesale_price: 12, category: 'Snacks', image_url: 'https://images.unsplash.com/photo-1627662054097-cf7c2f7f9b7c?w=200', stock: 200 },
  { id: 'p5', name: '5kg Rice - Sinandomeng', description: null, price: 280, wholesale_price: 250, category: 'Rice', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200', stock: 30 },
  { id: 'p6', name: '555 Sardines', description: null, price: 25, wholesale_price: 18, category: 'Canned Goods', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200', stock: 150 },
  { id: 'p7', name: 'Argentina Corned Beef', description: null, price: 45, wholesale_price: 35, category: 'Canned Goods', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200', stock: 60 },
  { id: 'p8', name: 'Bear Brand Milk Powder', description: null, price: 220, wholesale_price: 180, category: 'Dairy', image_url: 'https://images.unsplash.com/photo-1563636619-e9143da674d8?w=200', stock: 40 },
  { id: 'p9', name: 'Great Taste Coffee', description: null, price: 110, wholesale_price: 85, category: 'Dairy', image_url: 'https://images.unsplash.com/photo-1563636619-e9143da674d8?w=200', stock: 70 },
  { id: 'p10', name: 'Piattos Chips', description: null, price: 32, wholesale_price: 25, category: 'Snacks', image_url: 'https://images.unsplash.com/photo-1627662054097-cf7c2f7f9b7c?w=200', stock: 80 },
];

export const mockUsers: User[] = [
  { id: 'u1', email: 'consumer@marketup.com', name: 'John Consumer', role: 'consumer', phone: '09123456789', address: '123 Main St, Manila', points: 450, avatar_url: null, created_at: '2026-01-15T08:00:00Z' },
  { id: 'u2', email: 'rider@marketup.com', name: 'Jane Rider', role: 'rider', phone: '09876543210', address: '456 Oak Ave, Quezon City', points: 0, avatar_url: null, created_at: '2026-02-20T10:00:00Z' },
  { id: 'u3', email: 'admin@marketup.com', name: 'Admin User', role: 'admin', phone: '09123456780', address: '789 Pine Rd, Makati', points: 0, avatar_url: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'u4', email: 'guest@marketup.com', name: 'Guest User', role: 'consumer', phone: '', address: '', points: 0, avatar_url: null, created_at: '2026-07-01T00:00:00Z' },
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    consumer_id: 'u1',
    rider_id: 'u2',
    status: 'delivered',
    total: 249,
    delivery_fee: 49,
    payment_method: 'cod',
    delivery_address: '123 Main St, Manila',
    notes: null,
    items: [
      { product_id: 'p1', name: 'Coca-Cola 1.5L', quantity: 2, price: 75 },
      { product_id: 'p4', name: 'Lucky Me! Noodles', quantity: 3, price: 18 },
    ],
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'o2',
    consumer_id: 'u1',
    rider_id: null,
    status: 'pending',
    total: 329,
    delivery_fee: 49,
    payment_method: 'gcash',
    delivery_address: '123 Main St, Manila',
    notes: null,
    items: [
      { product_id: 'p5', name: '5kg Rice - Sinandomeng', quantity: 1, price: 280 },
    ],
    created_at: '2026-07-02T14:30:00Z',
  },
  {
    id: 'o3',
    consumer_id: 'u1',
    rider_id: 'u2',
    status: 'out_for_delivery',
    total: 214,
    delivery_fee: 49,
    payment_method: 'cod',
    delivery_address: '123 Main St, Manila',
    notes: null,
    items: [
      { product_id: 'p3', name: 'San Miguel Beer', quantity: 3, price: 55 },
    ],
    created_at: '2026-07-03T09:15:00Z',
  },
];

export function formatPeso(amount: number) {
  return `₱${Number(amount).toLocaleString()}`;
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Accepted',
    assigned: 'Assigned',
    picked_up: 'Picked up',
    out_for_delivery: 'On the way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    delivery_failed: 'Failed',
  };
  return labels[status] ?? status.replace('_', ' ');
}

export const ORDER_STATUSES = ['pending', 'confirmed', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  picked_up: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  delivery_failed: 'bg-red-100 text-red-800',
};

export function peso(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

export const RIDER_ACTIVE_STATUSES = ['confirmed', 'assigned', 'picked_up', 'out_for_delivery'] as const;

export const STORE_ADDRESS = '123 Wholesale Ave, Quezon City, Metro Manila';

export const DELIVERY_FEE = 49;

export const PRODUCT_CATEGORIES = [
  'All',
  'Soft Drinks',
  'Snacks',
  'Rice',
  'Canned Goods',
  'Dairy',
] as const;

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Guest mode helpers (kept for backward compat with unused routes)
export const GUEST_MODE_KEY = "marketup_guest_mode";
export const GUEST_USER_KEY = "marketup_guest_user";

export const guestUser = {
  id: "guest-user-123",
  email: "guest@marketup.com",
  name: "Guest User",
  role: "consumer" as const,
};

export function isGuestMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(GUEST_MODE_KEY) === "true";
  } catch {
    return false;
  }
}

export function enableGuestMode() {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_MODE_KEY, "true");
  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
}

export function clearGuestMode() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_MODE_KEY);
  localStorage.removeItem(GUEST_USER_KEY);
}
