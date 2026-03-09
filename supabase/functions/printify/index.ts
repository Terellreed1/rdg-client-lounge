import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRINTIFY_API_URL = 'https://api.printify.com/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const PRINTIFY_API_KEY = Deno.env.get('PRINTIFY_API_KEY');
  if (!PRINTIFY_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Printify API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  const headers = {
    'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    // Get shops first to find shop ID
    if (action === 'shops') {
      const res = await fetch(`${PRINTIFY_API_URL}/shops.json`, { headers });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get products for a shop
    if (action === 'products') {
      const shopId = url.searchParams.get('shop_id');
      if (!shopId) {
        // First get shops to find the shop ID
        const shopsRes = await fetch(`${PRINTIFY_API_URL}/shops.json`, { headers });
        const shops = await shopsRes.json();
        
        if (!shops || shops.length === 0) {
          return new Response(JSON.stringify({ error: 'No shops found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const firstShopId = shops[0].id;
        const productsRes = await fetch(`${PRINTIFY_API_URL}/shops/${firstShopId}/products.json`, { headers });
        const products = await productsRes.json();
        
        return new Response(JSON.stringify({ shop_id: firstShopId, products }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const productsRes = await fetch(`${PRINTIFY_API_URL}/shops/${shopId}/products.json`, { headers });
      const products = await productsRes.json();
      
      return new Response(JSON.stringify(products), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get single product details
    if (action === 'product') {
      const shopId = url.searchParams.get('shop_id');
      const productId = url.searchParams.get('product_id');
      
      if (!shopId || !productId) {
        return new Response(JSON.stringify({ error: 'shop_id and product_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const productRes = await fetch(`${PRINTIFY_API_URL}/shops/${shopId}/products/${productId}.json`, { headers });
      const product = await productRes.json();
      
      return new Response(JSON.stringify(product), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create order
    if (action === 'order' && req.method === 'POST') {
      const body = await req.json();
      const { shop_id, line_items, address_to, shipping_method } = body;
      
      if (!shop_id || !line_items || !address_to) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const orderRes = await fetch(`${PRINTIFY_API_URL}/shops/${shop_id}/orders.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          external_id: `lcc-${Date.now()}`,
          label: 'LSC Merch Order',
          line_items,
          shipping_method: shipping_method || 1,
          send_shipping_notification: true,
          address_to,
        }),
      });
      
      const order = await orderRes.json();
      
      if (!orderRes.ok) {
        return new Response(JSON.stringify({ error: 'Failed to create order', details: order }), {
          status: orderRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify(order), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate shipping
    if (action === 'shipping' && req.method === 'POST') {
      const body = await req.json();
      const { shop_id, line_items, address_to } = body;
      
      const shippingRes = await fetch(`${PRINTIFY_API_URL}/shops/${shop_id}/orders/shipping.json`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ line_items, address_to }),
      });
      
      const shipping = await shippingRes.json();
      
      return new Response(JSON.stringify(shipping), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Printify API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
