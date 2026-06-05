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
] as const;

export const ORDER_STATUS_STEP: Record<string, number> = {
  pending: 0,
  confirmed: 0,
  assigned: 1,
  picked_up: 2,
  delivered: 3,
  cancelled: -1,
};

export const REDEEM_REWARD = { name: "₱50 off coupon", cost: 500, value: 50 };

export const ADDRESS_STORAGE_KEY = "markup_delivery_address";
