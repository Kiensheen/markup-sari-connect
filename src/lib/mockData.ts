// Mock data for guest mode / frontend-only testing.

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

export interface MockProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  wholesale_price: number;
  stock: number;
  category: string | null;
  image_url: string | null;
}

export const mockProducts: MockProduct[] = [
  { id: "m1", name: "Coca-Cola 1.5L", description: "Classic soft drink", price: 75, wholesale_price: 65, stock: 50, category: "Soft Drinks", image_url: null },
  { id: "m2", name: "Pepsi 1.5L", description: null, price: 70, wholesale_price: 60, stock: 40, category: "Soft Drinks", image_url: null },
  { id: "m3", name: "San Miguel Beer", description: null, price: 55, wholesale_price: 45, stock: 100, category: "Soft Drinks", image_url: null },
  { id: "m4", name: "Lucky Me! Noodles", description: null, price: 18, wholesale_price: 12, stock: 200, category: "Snacks", image_url: null },
  { id: "m5", name: "5kg Rice - Sinandomeng", description: null, price: 280, wholesale_price: 250, stock: 20, category: "Rice", image_url: null },
  { id: "m6", name: "555 Sardines", description: null, price: 25, wholesale_price: 18, stock: 150, category: "Canned Goods", image_url: null },
  { id: "m7", name: "Argentina Corned Beef", description: null, price: 45, wholesale_price: 35, stock: 80, category: "Canned Goods", image_url: null },
  { id: "m8", name: "Bear Brand Milk Powder", description: null, price: 220, wholesale_price: 180, stock: 30, category: "Dairy", image_url: null },
  { id: "m9", name: "Great Taste Coffee", description: null, price: 110, wholesale_price: 85, stock: 60, category: "Dairy", image_url: null },
  { id: "m10", name: "Piattos Chips", description: null, price: 32, wholesale_price: 25, stock: 120, category: "Snacks", image_url: null },
];

export const mockOrders = [
  { id: "1", status: "delivered", total: 249, items: [{ name: "Coca-Cola", quantity: 2, price: 75 }], date: "2026-07-01", delivery_address: "123 Main St" },
  { id: "2", status: "out_for_delivery", total: 149, items: [{ name: "Rice 5kg", quantity: 1, price: 280 }], date: "2026-07-02", delivery_address: "456 Oak Ave" },
  { id: "3", status: "picked_up", total: 399, items: [{ name: "San Miguel Beer", quantity: 6, price: 55 }], date: "2026-07-03", delivery_address: "789 Pine Rd" },
];
