CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id text UNIQUE,
  customer_name text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  delivery_method text NOT NULL DEFAULT 'postal',
  delivery_address text NOT NULL DEFAULT '',
  delivery_city text NOT NULL DEFAULT '',
  delivery_state text NOT NULL DEFAULT '',
  delivery_zip text NOT NULL DEFAULT '',
  pickup_location text,
  time_slot text,
  delivery_fee numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'paid',
  notes text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read own orders by email"
  ON public.orders FOR SELECT TO public
  USING (true);