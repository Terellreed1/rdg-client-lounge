import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const PRINTIFY_API_URL = 'https://api.printify.com/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const PRINTIFY_API_KEY = Deno.env.get('PRINTIFY_API_KEY');

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error('Missing required secrets');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);

    console.log(`Received Stripe event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata || {};

      // Handle cannabis orders — save to orders table
      if (meta.type === 'cannabis_order') {
        console.log('Processing cannabis order');

        let orderItems = [];
        try { orderItems = JSON.parse(meta.order_items || '[]'); } catch { orderItems = []; }

        const orderData = {
          stripe_session_id: session.id,
          customer_name: meta.customer_name || '',
          customer_email: meta.customer_email || session.customer_details?.email || '',
          customer_phone: meta.customer_phone || '',
          delivery_method: meta.delivery_method || 'postal',
          delivery_address: meta.delivery_address || '',
          delivery_city: meta.delivery_city || '',
          delivery_state: meta.delivery_state || '',
          delivery_zip: meta.delivery_zip || '',
          pickup_location: meta.pickup_location || null,
          time_slot: meta.time_slot || '',
          delivery_fee: parseFloat(meta.delivery_fee || '0'),
          subtotal: parseFloat(meta.subtotal || '0'),
          total: parseFloat(meta.total || '0'),
          items: orderItems,
          status: 'paid',
        };

        const { error: orderError } = await supabase.from('orders').insert(orderData);
        if (orderError) {
          console.error('Failed to save order:', orderError);
        } else {
          console.log('Order saved successfully');
        }
      }

      // Handle merch orders — Printify fulfillment
      if (meta.type === 'merch_order' && PRINTIFY_API_KEY) {
        console.log('Processing merch order for Printify fulfillment');

        const shopId = meta.printify_shop_id;
        const productId = meta.printify_product_id;
        const variantId = meta.printify_variant_id;
        const quantity = parseInt(meta.quantity || '1');

        if (shopId && productId && variantId) {
          const shippingDetails = session.shipping_details;
          if (shippingDetails?.address) {
            const address = shippingDetails.address;
            const nameParts = (shippingDetails.name || 'Customer').split(' ');
            const firstName = nameParts[0] || 'Customer';
            const lastName = nameParts.slice(1).join(' ') || '';

            const printifyOrder = {
              external_id: `stripe_${session.id}`,
              label: `LSC Order ${session.id.slice(-8)}`,
              line_items: [{ product_id: productId, variant_id: parseInt(variantId), quantity }],
              shipping_method: 1,
              send_shipping_notification: true,
              address_to: {
                first_name: firstName, last_name: lastName,
                email: session.customer_details?.email || '',
                phone: session.customer_details?.phone || '',
                country: address.country || 'US', region: address.state || '',
                address1: address.line1 || '', address2: address.line2 || '',
                city: address.city || '', zip: address.postal_code || '',
              },
            };

            const printifyResponse = await fetch(`${PRINTIFY_API_URL}/shops/${shopId}/orders.json`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(printifyOrder),
            });

            const printifyResult = await printifyResponse.json();
            if (!printifyResponse.ok) {
              console.error('Printify order creation failed:', printifyResult);
            } else {
              console.log('Printify order created successfully:', printifyResult.id);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', details: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
