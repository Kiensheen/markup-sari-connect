-- Optional schema updates for MarkUp consumer app
-- Run in Supabase SQL Editor if not already applied

-- Add GCash as a distinct payment method (optional; app currently maps GCash → 'online')
ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'gcash';

-- Add bottle exchange flag on orders (optional; app currently stores in notes)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS bottle_exchange BOOLEAN NOT NULL DEFAULT false;

-- Seed sample products with categories (skip if products already exist)
INSERT INTO public.products (name, description, price, wholesale_price, stock, category, image_url)
SELECT * FROM (VALUES
  ('Coca-Cola 1.5L', 'Classic cola soft drink', 65.00, 52.00, 100, 'Soft Drinks', 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400'),
  ('Sprite 1.5L', 'Lemon-lime soda', 60.00, 48.00, 80, 'Soft Drinks', 'https://images.unsplash.com/photo-1625777342773-c2245f621b9a?w=400'),
  ('Chippy Original 110g', 'Corn snack chips', 25.00, 18.00, 200, 'Snacks', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'),
  ('Piattos Cheese 85g', 'Potato crisps', 30.00, 22.00, 150, 'Snacks', 'https://images.unsplash.com/photo-1613919113640-25732cd5a066?w=400'),
  ('Sinandomeng Rice 5kg', 'Premium white rice', 280.00, 240.00, 50, 'Rice', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
  ('Dinorado Rice 5kg', 'Aromatic rice', 320.00, 275.00, 40, 'Rice', 'https://images.unsplash.com/photo-1536304929838-5a0c0b0b0b0b?w=400'),
  ('Argentina Corned Beef 260g', 'Classic canned corned beef', 85.00, 72.00, 120, 'Canned Goods', 'https://images.unsplash.com/photo-1604908177525-451366552963?w=400'),
  ('Century Tuna Flakes 155g', 'Tuna in oil', 45.00, 38.00, 180, 'Canned Goods', 'https://images.unsplash.com/photo-1604908176997-125f29c7094a?w=400'),
  ('Alaska Evaporated Milk 370ml', 'Evaporated milk', 35.00, 28.00, 90, 'Dairy', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'),
  ('Bear Brand Powder Milk 300g', 'Fortified milk powder', 120.00, 98.00, 60, 'Dairy', 'https://images.unsplash.com/photo-1550583724-b2692b85b147?w=400')
) AS v(name, description, price, wholesale_price, stock, category, image_url)
WHERE NOT EXISTS (SELECT 1 FROM public.products LIMIT 1);
