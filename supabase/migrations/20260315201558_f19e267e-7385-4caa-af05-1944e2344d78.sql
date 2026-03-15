
-- Allow anyone to upload to product-images bucket (admin manages via edge function auth)
CREATE POLICY "Allow public uploads to product-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

-- Allow public reads on product-images
CREATE POLICY "Allow public reads on product-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow deletions on product-images
CREATE POLICY "Allow public deletes on product-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'product-images');
