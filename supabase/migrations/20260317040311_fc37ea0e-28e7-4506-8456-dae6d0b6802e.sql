
-- Add compliance fields to state_laws
ALTER TABLE public.state_laws 
  ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC NOT NULL DEFAULT 9.99,
  ADD COLUMN IF NOT EXISTS estimated_days INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS min_age INTEGER NOT NULL DEFAULT 21;

-- Create service_areas table for ZIP-code-based local delivery zones
CREATE TABLE public.service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zip_codes TEXT[] NOT NULL DEFAULT '{}',
  delivery_fee NUMERIC NOT NULL DEFAULT 10.00,
  estimated_time_minutes INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GIN index for fast ZIP code lookups
CREATE INDEX idx_service_areas_zip_codes ON public.service_areas USING GIN(zip_codes);

-- RLS
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active service areas"
  ON public.service_areas FOR SELECT TO public
  USING (is_active = true);
