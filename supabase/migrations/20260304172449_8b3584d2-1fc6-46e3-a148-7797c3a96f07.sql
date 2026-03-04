UPDATE products SET image_url = 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/terp-quencherz-front.png' WHERE id = 'bd4e7bae-1685-4263-941b-dcb6caff25e4';

INSERT INTO product_images (product_id, image_url, sort_order) VALUES
  ('bd4e7bae-1685-4263-941b-dcb6caff25e4', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/terp-quencherz-front.png', 0),
  ('bd4e7bae-1685-4263-941b-dcb6caff25e4', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/terp-quencherz-open.png', 1),
  ('bd4e7bae-1685-4263-941b-dcb6caff25e4', 'https://bsmujjrfwyqlfdqnjpes.supabase.co/storage/v1/object/public/product-images/terp-quencherz-box.png', 2)
ON CONFLICT DO NOTHING;