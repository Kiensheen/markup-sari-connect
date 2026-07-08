import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { mockProducts, mockUsers, mockOrders, type Product, type Order, type User, type AdminStats, type RiderStats, type OrderItem, generateId, DELIVERY_FEE } from "@/lib/mockData";

interface MockContextValue {
  currentUser: User;
  role: 'consumer' | 'rider' | 'admin';
  switchRole: (role: 'consumer' | 'rider' | 'admin') => void;

  products: Product[];
  orders: Order[];
  users: User[];

  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  cartItems: { product: Product; quantity: number }[];
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;

  createOrder: (address: string, phone: string, payment: string, notes: string) => Order;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
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

  riderStats: RiderStats;
  adminStats: AdminStats;
}

const Ctx = createContext<MockContextValue>(null!);

const ROLE_USER_MAP: Record<string, string> = {
  consumer: 'u1',
  rider: 'u2',
  admin: 'u3',
};

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getInitialCart(): { product: Product; quantity: number }[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('marketup_cart2') : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function MockProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<'consumer' | 'rider' | 'admin'>('consumer');
  const [currentUser, setCurrentUser] = useState<User>(() => deepClone(mockUsers[0]));
  const [orders, setOrders] = useState<Order[]>(() => deepClone(mockOrders));
  const [products, setProducts] = useState<Product[]>(() => deepClone(mockProducts));
  const [users, setUsers] = useState<User[]>(() => deepClone(mockUsers));
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>(getInitialCart);

  const persistCart = useCallback((items: { product: Product; quantity: number }[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketup_cart2', JSON.stringify(items));
    }
  }, []);

  const switchRole = useCallback((newRole: 'consumer' | 'rider' | 'admin') => {
    setRole(newRole);
    const userId = ROLE_USER_MAP[newRole];
    const user = users.find((u) => u.id === userId) ?? users[0];
    setCurrentUser(deepClone(user));
    if (typeof window !== 'undefined') {
      const paths: Record<string, string> = {
        consumer: '/',
        rider: '/rider/dashboard',
        admin: '/admin/dashboard',
      };
      window.location.href = paths[newRole];
    }
  }, [users]);

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
    (address: string, _phone: string, payment: string, notes: string) => {
      const orderItems: OrderItem[] = cartItems.map((c) => ({
        product_id: c.product.id,
        name: c.product.name,
        quantity: c.quantity,
        price: c.product.wholesale_price,
      }));
      const total = cartTotal + DELIVERY_FEE;
      const newOrder: Order = {
        id: `o${generateId()}`,
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

  const updateOrderStatus = useCallback((orderId: string, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: status as Order['status'] } : o))
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
    switchRole,
    products,
    orders,
    users,
    addToCart,
    removeFromCart,
    updateCartQty,
    cartItems,
    cartTotal,
    cartCount,
    clearCart,
    createOrder,
    cancelOrder,
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
    riderStats,
    adminStats,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useMock = () => useContext(Ctx);
