-- Clear old product images and products
DELETE FROM product_images;
DELETE FROM products;

-- Insert new products
INSERT INTO products (id, name, brand, price, qty, image_url, description, product_type, strain, sort_order, active)
VALUES
  ('a1000001-0001-0001-0001-000000000001', 'Motor City Blitz', 'Super Candy Bros', '$65', 15, 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/motor-city-blitz-1.png', 'Detroit-inspired powerhouse with a hard-hitting hybrid profile. Motor City Blitz delivers an explosive rush of energy with gassy, citrus-forward terps and a smooth, creamy finish. Built for champions.', 'Flower', 'Hybrid', 1, true),
  ('a1000001-0001-0001-0001-000000000002', 'The 6 Mile Hittaz', 'Super Candy Bros', '$65', 12, 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/6-mile-hittaz-1.png', 'Straight from the block — The 6 Mile Hittaz hits hard with fiery, spicy terps and a knockout indica body high. Ghetto Boyz Champions edition. Keep that stick with you.', 'Flower', 'Indica', 2, true),
  ('a1000001-0001-0001-0001-000000000003', 'Pain Over Politics', 'Pain Network', '$65', 10, 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/pain-over-politics-1.png', 'Premium cannabis from The Painpuff Girls collection. Pain Over Politics is a smooth, potent hybrid with candy-sweet terps and a relaxing full-body buzz. 3.5 grams of pure vibes.', 'Flower', 'Hybrid', 3, true),
  ('a1000001-0001-0001-0001-000000000004', 'Cherry Pixie Sticks', 'Always Faded', '$65', 8, 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/cherry-pixie-sticks.png', 'Nostalgic pixie stick sweetness meets tart cherry. Light, playful, and perfect for social smoke sessions. Always Faded keeps it tropical and sweet.', 'Flower', 'Sativa', 4, true),
  ('a1000001-0001-0001-0001-000000000005', 'The East Side Shooterz', 'Super Candy Bros', '$65', 10, 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/east-side-shooterz.png', 'Balling out with The East Side Shooterz — a court-side classic from Super Candy Bros. Explosive fruity terps with a focused, energetic high. Ghetto Boyz Champions 2026.', 'Flower', 'Sativa', 5, true);

-- Insert multi-image entries for Motor City Blitz
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
  ('a1000001-0001-0001-0001-000000000001', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/motor-city-blitz-1.png', 0),
  ('a1000001-0001-0001-0001-000000000001', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/motor-city-blitz-2.png', 1),
  ('a1000001-0001-0001-0001-000000000001', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/motor-city-blitz-3.png', 2);

-- Insert multi-image entries for The 6 Mile Hittaz
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
  ('a1000001-0001-0001-0001-000000000002', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/6-mile-hittaz-1.png', 0),
  ('a1000001-0001-0001-0001-000000000002', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/6-mile-hittaz-2.png', 1);

-- Insert multi-image entries for Pain Over Politics
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
  ('a1000001-0001-0001-0001-000000000003', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/pain-over-politics-1.png', 0),
  ('a1000001-0001-0001-0001-000000000003', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/pain-over-politics-2.png', 1);

-- Single image products
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
  ('a1000001-0001-0001-0001-000000000004', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/cherry-pixie-sticks.png', 0),
  ('a1000001-0001-0001-0001-000000000005', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/east-side-shooterz.png', 0);