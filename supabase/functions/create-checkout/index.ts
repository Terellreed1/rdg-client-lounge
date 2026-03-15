import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { items, orderMeta } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    const line_items = items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Store order metadata in Stripe session
    const metadata: Record<string, string> = {};
    if (orderMeta) {
      metadata.delivery_method = orderMeta.delivery_method || "";
      metadata.customer_name = orderMeta.customer_name || "";
      metadata.customer_email = orderMeta.customer_email || "";
      metadata.customer_phone = orderMeta.customer_phone || "";
      metadata.delivery_address = orderMeta.delivery_address || "";
      metadata.delivery_city = orderMeta.delivery_city || "";
      metadata.delivery_state = orderMeta.delivery_state || "";
      metadata.delivery_zip = orderMeta.delivery_zip || "";
      metadata.pickup_location = orderMeta.pickup_location || "";
      metadata.time_slot = orderMeta.time_slot || "";
      metadata.delivery_fee = String(orderMeta.delivery_fee || 0);
      metadata.subtotal = String(orderMeta.subtotal || 0);
      metadata.total = String(orderMeta.total || 0);
      metadata.order_items = JSON.stringify(orderMeta.items || []);
      metadata.type = "cannabis_order";
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: orderMeta?.customer_email || undefined,
      metadata,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Checkout error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
