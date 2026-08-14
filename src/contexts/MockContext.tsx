import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { mockProducts, mockUsers, mockOrders, type Product, type Order, type User, type AdminStats, type RiderStats, type OrderItem, type SupportThread, generateId, generateOrderId, DELIVERY_FEE } from "@/lib/mockData";

interface MockContextValue {
  currentUser: User;
  role: 'consumer' | 'rider' | 'admin';

  products: Product[];
  orders: Order[];
  users: User[];
  supportThreads: SupportThread[];

  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  cartItems: { product: Product; quantity: number }[];
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;

  createOrder: (address: string, phone: string, payment: string, notes?: string) => Order;
  cancelOrder: (orderId: string) => void;
  deleteOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: string, adminNote?: string | null) => void;
  assignRider: (orderId: string, riderId: string) => void;

  acceptDelivery: (orderId: string) => void;
  markPickedUp: (orderId: string) => void;
  markOnTheWay: (orderId: string) => void;
  markDelivered: (orderId: string) => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  blockUser: (userId: string, duration?: '24h' | '7d' | 'permanent') => void;
  unblockUser: (userId: string) => void;
  adjustPoints: (userId: string, delta: number) => void;

  sendSupportMessage: (consumerId: string, text: string) => void;
  replySupportMessage: (threadId: string, text: string) => void;

  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  riderStats: RiderStats;
  adminStats: AdminStats;
}

const Ctx = createContext<MockContextValue>(null!);

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// LocalStorage keys
const STORAGE_KEYS = {
  cart: 'marketup_cart2',
  orders: 'marketup_orders',
  products: 'marketup_products',
  users: 'marketup_users',
  support_threads: 'marketup_support_threads',
  notifications_enabled: 'marketup_notifications_enabled',
} as const;

// Helper to load from localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

// Helper to save to localStorage
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function getInitialCart(): { product: Product; quantity: number }[] {
  return loadFromStorage(STORAGE_KEYS.cart, []);
}

function getInitialOrders(): Order[] {
  // If no saved orders, use mockOrders with current dates
  const saved = loadFromStorage<Order[] | null>(STORAGE_KEYS.orders, null);
  return saved ?? deepClone(mockOrders);
}

function getInitialProducts(): Product[] {
  // If no saved products, use mockProducts
  const saved = loadFromStorage<Product[] | null>(STORAGE_KEYS.products, null);
  return saved ?? deepClone(mockProducts);
}

function getInitialUsers(): User[] {
  // If no saved users, use mockUsers
  const saved = loadFromStorage<User[] | null>(STORAGE_KEYS.users, null);
  return saved ?? deepClone(mockUsers);
}

function getInitialSupportThreads(): SupportThread[] {
  return loadFromStorage<SupportThread[] | null>(STORAGE_KEYS.support_threads, null) ?? [];
}

export function MockProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(() => getInitialUsers()[0]);
  // Role always comes from the user record, never from the URL path.
  const role: 'consumer' | 'rider' | 'admin' = currentUser.role;
  const [orders, setOrders] = useState<Order[]>(getInitialOrders);
  const [products, setProducts] = useState<Product[]>(getInitialProducts);
  const [users, setUsers] = useState<User[]>(getInitialUsers);
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>(getInitialCart);
  const [supportThreads, setSupportThreads] = useState<SupportThread[]>(getInitialSupportThreads);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    () => loadFromStorage<boolean | null>(STORAGE_KEYS.notifications_enabled, null) ?? true,
  );

  // Dev-mode convenience: switch the mock user based on the route.
  // This is ONLY for local testing. Authorization must read the role from
  // currentUser.role (see AuthGuard), never from the URL path.
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let newUserId = 'u1';

    if (path.startsWith('/rider')) {
      newUserId = 'u2';
    } else if (path.startsWith('/admin')) {
      newUserId = 'u3';
    }

    // Use persisted users when switching roles
    setCurrentUser(deepClone(users.find(u => u.id === newUserId) ?? mockUsers[0]));
  }, [location.pathname, users]);

  // Persist orders to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.orders, orders);
  }, [orders]);

  // Persist products to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.products, products);
  }, [products]);

  // Persist users (including points) to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.users, users);
  }, [users]);

  // Persist support threads to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.support_threads, supportThreads);
  }, [supportThreads]);

  // Persist notification preference to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.notifications_enabled, notificationsEnabled);
  }, [notificationsEnabled]);

  // Persist cart to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.cart, cartItems);
  }, [cartItems]);

  const persistCart = useCallback((items: { product: Product; quantity: number }[]) => {
    saveToStorage(STORAGE_KEYS.cart, items);
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const found = prev.find((c) => c.product.id === product.id);
      if (found) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((c) => c.product.id !== productId));
  }, []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((c) => c.product.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((c) => (c.product.id === productId ? { ...c, quantity: qty } : c))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    persistCart([]);
  }, [persistCart]);

  const cartTotal = useMemo(
    () => cartItems.reduce((s, c) => s + c.product.wholesale_price * c.quantity, 0),
    [cartItems]
  );
  const cartCount = useMemo(
    () => cartItems.reduce((s, c) => s + c.quantity, 0),
    [cartItems]
  );

  const createOrder = useCallback(
    (address: string, _phone: string, payment: string, notes?: string) => {
      const orderItems: OrderItem[] = cartItems.map((c) => ({
        product_id: c.product.id,
        name: c.product.name,
        quantity: c.quantity,
        price: c.product.wholesale_price,
      }));
      const total = cartTotal + DELIVERY_FEE;
      const newOrder: Order = {
        id: generateOrderId(),
        consumer_id: currentUser.id,
        rider_id: null,
        status: 'pending',
        total,
        delivery_fee: DELIVERY_FEE,
        payment_method: payment,
        delivery_address: address,
        notes: notes || null,
        items: orderItems,
        created_at: new Date().toISOString(),
      };
      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      return newOrder;
    },
    [cartItems, cartTotal, currentUser.id, clearCart]
  );

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' as const } : o))
    );
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => {
      // Only completed (delivered) orders may be removed from history.
      const target = prev.find((o) => o.id === orderId);
      if (!target || target.status !== 'delivered') return prev;
      return prev.filter((o) => o.id !== orderId);
    });
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: string, adminNote?: string | null) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = { ...o, status: status as Order['status'] };
        // Cancellation reason lives in admin_note, never in the customer's notes.
        if (adminNote !== undefined) {
          next.admin_note = adminNote ?? null;
        }
        return next;
      })
    );
  }, []);

  const assignRider = useCallback((orderId: string, riderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, rider_id: riderId || null, status: riderId ? ('assigned' as const) : o.status } : o
      )
    );
  }, []);

  const acceptDelivery = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, rider_id: currentUser.id, status: 'confirmed' as const } : o
      )
    );
  }, [currentUser.id]);

  const markPickedUp = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'picked_up');
  }, [updateOrderStatus]);

  const markOnTheWay = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'out_for_delivery');
  }, [updateOrderStatus]);

  const markDelivered = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
  }, [updateOrderStatus]);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: `p${generateId()}` };
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const updateUserProfile = useCallback((userId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  }, [currentUser.id]);

  const blockUser = useCallback((userId: string, duration?: '24h' | '7d' | 'permanent') => {
    const updates: Partial<User> = duration === 'permanent'
      ? { is_blocked: true, blocked_until: null }
      : { is_blocked: true, blocked_until: new Date(Date.now() + (duration === '24h' ? 24 : 24 * 7) * 60 * 60 * 1000).toISOString() };
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
  }, []);

  const unblockUser = useCallback((userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_blocked: false, blocked_until: null } : u)));
  }, []);

  const adjustPoints = useCallback((userId: string, delta: number) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, points: Math.max(0, u.points + delta) } : u)));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, points: Math.max(0, prev.points + delta) }));
    }
  }, [currentUser.id]);

  const sendSupportMessage = useCallback((consumerId: string, text: string) => {
    setSupportThreads((prev) => {
      // Find or create thread for this consumer
      const consumer = users.find((u) => u.id === consumerId);
      if (!consumer) return prev;

      let thread = prev.find((t) => t.consumer_id === consumerId);
      if (!thread) {
        thread = {
          id: `st${generateId()}`,
          consumer_id: consumerId,
          consumer_name: consumer.name,
          messages: [],
          created_at: new Date().toISOString(),
        };
        prev = [...prev, thread];
      }

      const newMessage = {
        id: `sm${generateId()}`,
        sender: 'consumer' as const,
        text,
        created_at: new Date().toISOString(),
      };
      return prev.map((t) => (t.id === thread!.id ? { ...t, messages: [...t.messages, newMessage] } : t));
    });
  }, [users]);

  const replySupportMessage = useCallback((threadId: string, text: string) => {
    setSupportThreads((prev) => {
      const thread = prev.find((t) => t.id === threadId);
      if (!thread) return prev;

      const newMessage = {
        id: `sm${generateId()}`,
        sender: 'admin' as const,
        text,
        created_at: new Date().toISOString(),
      };
      return prev.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, newMessage] } : t));
    });
  }, []);

  const riderStats = useMemo((): RiderStats => {
    if (role !== 'rider') return { total_deliveries: 0, total_earnings: 0, rating: 0 };
    const delivered = orders.filter((o) => o.rider_id === currentUser.id && o.status === 'delivered');
    return {
      total_deliveries: delivered.length,
      total_earnings: delivered.reduce((s, o) => s + o.delivery_fee, 0),
      rating: 4.8,
    };
  }, [orders, role, currentUser.id]);

  const adminStats = useMemo((): AdminStats => {
    const today = new Date().toISOString().slice(0, 10);
    const ordersToday = orders.filter((o) => o.created_at.slice(0, 10) === today);
    return {
      total_orders: orders.length,
      total_revenue: orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
      total_consumers: users.filter((u) => u.role === 'consumer').length,
      total_riders: users.filter((u) => u.role === 'rider').length,
      total_products: products.length,
      pending_orders: orders.filter((o) => o.status === 'pending').length,
      orders_today: ordersToday.length,
      revenue_today: ordersToday.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
    };
  }, [orders, users, products]);

  const value: MockContextValue = {
    currentUser,
    role,
    products,
    orders,
    users,
    supportThreads,
    addToCart,
    removeFromCart,
    updateCartQty,
    cartItems,
    cartTotal,
    cartCount,
    clearCart,
    createOrder,
    cancelOrder,
    deleteOrder,
    updateOrderStatus,
    assignRider,
    acceptDelivery,
    markPickedUp,
    markOnTheWay,
    markDelivered,
    addProduct,
    updateProduct,
    deleteProduct,
    updateUserProfile,
    blockUser,
    unblockUser,
    adjustPoints,
    sendSupportMessage,
    replySupportMessage,
    notificationsEnabled,
    setNotificationsEnabled,
    riderStats,
    adminStats,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useMock = () => useContext(Ctx);
