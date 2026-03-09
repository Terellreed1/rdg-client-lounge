import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

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

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !PRINTIFY_API_KEY) {
    console.error('Missing required secrets');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

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
      
      // Check if this is a merch order
      if (session.metadata?.type !== 'merch_order') {
        console.log('Not a merch order, skipping Printify fulfillment');
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Processing merch order for Printify fulfillment');

      const shopId = session.metadata.printify_shop_id;
      const productId = session.metadata.printify_product_id;
      const variantId = session.metadata.printify_variant_id;
      const quantity = parseInt(session.metadata.quantity || '1');

      if (!shopId || !productId || !variantId) {
        console.error('Missing Printify metadata in session');
        return new Response(
          JSON.stringify({ error: 'Missing Printify metadata' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get shipping details from the session
      const shippingDetails = session.shipping_details;
      if (!shippingDetails?.address) {
        console.error('No shipping address in session');
        return new Response(
          JSON.stringify({ error: 'No shipping address provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const address = shippingDetails.address;
      const nameParts = (shippingDetails.name || 'Customer').split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create Printify order
      const printifyOrder = {
        external_id: `stripe_${session.id}`,
        label: `LSC Order ${session.id.slice(-8)}`,
        line_items: [
          {
            product_id: productId,
            variant_id: parseInt(variantId),
            quantity: quantity,
          },
        ],
        shipping_method: 1, // Standard shipping
        send_shipping_notification: true,
        address_to: {
          first_name: firstName,
          last_name: lastName,
          email: session.customer_details?.email || '',
          phone: session.customer_details?.phone || '',
          country: address.country || 'US',
          region: address.state || '',
          address1: address.line1 || '',
          address2: address.line2 || '',
          city: address.city || '',
          zip: address.postal_code || '',
        },
      };

      console.log('Creating Printify order:', JSON.stringify(printifyOrder, null, 2));

      const printifyResponse = await fetch(
        `${PRINTIFY_API_URL}/shops/${shopId}/orders.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(printifyOrder),
        }
      );

      const printifyResult = await printifyResponse.json();

      if (!printifyResponse.ok) {
        console.error('Printify order creation failed:', printifyResult);
        // Don't return error - we still want to acknowledge the webhook
        // The payment was successful, just log the fulfillment issue
      } else {
        console.log('Printify order created successfully:', printifyResult.id);
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
