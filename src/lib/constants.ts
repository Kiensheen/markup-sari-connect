export const APP_VERSION = "1.0.0";

export const DELIVERY_FEE = 49;

export const PRODUCT_CATEGORIES = [
  "All",
  "Soft Drinks",
  "Snacks",
  "Rice",
  "Canned Goods",
  "Dairy",
] as const;

export const ORDER_STAGES = [
  "Order Placed",
  "Picked Up",
  "On the Way",
  "Delivered",
  "Delivery Failed",
] as const;

export const ORDER_STATUS_STEP: Record<string, number> = {
  pending: 0,
  confirmed: 0,
  assigned: 0,
  picked_up: 1,
  out_for_delivery: 2,
  delivered: 3,
  delivery_failed: 4,
  cancelled: -1,
};


export const REDEEM_REWARD = { name: "₱50 off coupon", cost: 500, value: 50 };

export const ADDRESS_STORAGE_KEY = "markup_delivery_address";
