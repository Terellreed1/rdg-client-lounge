import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyAdmin(supabase: ReturnType<typeof createClient>, token: string | null) {
  if (!token) return false;
  const { data } = await supabase
    .from("admin_sessions")
    .select("expires_at")
    .eq("token", token)
    .single();
  if (!data || new Date(data.expires_at) < new Date()) return false;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const action = url.searchParams.get("action") || req.method;

  // For GET requests, check auth from Authorization header
  // For POST requests, check auth from body or Authorization header
  let token: string | null = null;
  const authHeader = req.headers.get("Authorization");
  token = authHeader?.replace("Bearer ", "") || null;

  let body: Record<string, unknown> = {};
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    // Allow token from body as fallback
    if (!token && body.token) {
      token = body.token as string;
    }
  }

  const isAdmin = await verifyAdmin(supabase, token);

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── PRODUCTS ──
  if (resource === "products") {
    if (action === "GET" || req.method === "GET") {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order");
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "create") {
      const { data, error } = await supabase.from("products").insert(body).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        status: error ? 400 : 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "update") {
      const { id, ...rest } = body;
      const { data, error } = await supabase.from("products").update(rest).eq("id", id as string).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "delete") {
      const { error } = await supabase.from("products").delete().eq("id", body.id as string);
      return new Response(JSON.stringify(error ? { error } : { ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "reorder") {
      const items = body.items as { id: string; sort_order: number }[];
      if (!items?.length) {
        return new Response(JSON.stringify({ error: "No items provided" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (const item of items) {
        await supabase.from("products").update({ sort_order: item.sort_order }).eq("id", item.id);
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── FAQ ──
  if (resource === "faq") {
    if (action === "GET" || req.method === "GET") {
      const { data, error } = await supabase.from("faq_items").select("*").order("sort_order");
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "create") {
      const { data, error } = await supabase.from("faq_items").insert(body).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        status: error ? 400 : 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "update") {
      const { id, ...rest } = body;
      const { data, error } = await supabase.from("faq_items").update(rest).eq("id", id as string).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "delete") {
      const { error } = await supabase.from("faq_items").delete().eq("id", body.id as string);
      return new Response(JSON.stringify(error ? { error } : { ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── REVIEWS ──
  if (resource === "reviews") {
    if (action === "GET" || req.method === "GET") {
      const { data, error } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "create") {
      const { data, error } = await supabase.from("reviews").insert(body).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        status: error ? 400 : 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "update") {
      const { id, ...rest } = body;
      const { data, error } = await supabase.from("reviews").update(rest).eq("id", id as string).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "delete") {
      const { error } = await supabase.from("reviews").delete().eq("id", body.id as string);
      return new Response(JSON.stringify(error ? { error } : { ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── REFERRALS ──
  if (resource === "referrals") {
    if (action === "GET" || req.method === "GET") {
      const { data: codes, error: codesErr } = await supabase
        .from("referral_codes")
        .select("*, referral_signups(id, referred_name, referred_email, created_at)")
        .order("total_signups", { ascending: false });
      
      if (codesErr) {
        return new Response(JSON.stringify({ error: codesErr }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { count: totalCodes } = await supabase
        .from("referral_codes")
        .select("id", { count: "exact", head: true });
      const { count: totalSignups } = await supabase
        .from("referral_signups")
        .select("id", { count: "exact", head: true });

      return new Response(JSON.stringify({
        codes: codes || [],
        stats: { totalCodes: totalCodes || 0, totalSignups: totalSignups || 0 },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── BRANDS ──
  if (resource === "brands") {
    if (action === "GET" || req.method === "GET") {
      const { data, error } = await supabase.from("brands").select("*").order("sort_order");
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "create") {
      const { data, error } = await supabase.from("brands").insert(body).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        status: error ? 400 : 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "update") {
      const { id, ...rest } = body;
      const { data, error } = await supabase.from("brands").update(rest).eq("id", id as string).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "delete") {
      const { error } = await supabase.from("brands").delete().eq("id", body.id as string);
      return new Response(JSON.stringify(error ? { error } : { ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── STATE LAWS ──
  if (resource === "state_laws") {
    if (action === "GET" || req.method === "GET") {
      const { data, error } = await supabase.from("state_laws").select("*").order("state_name");
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "create") {
      const { data, error } = await supabase.from("state_laws").insert(body).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        status: error ? 400 : 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "update") {
      const { id, ...rest } = body;
      const { data, error } = await supabase.from("state_laws").update(rest).eq("id", id as string).select().single();
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "delete") {
      const { error } = await supabase.from("state_laws").delete().eq("id", body.id as string);
      return new Response(JSON.stringify(error ? { error } : { ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (action === "bulk_create") {
      const states = body.states as Record<string, unknown>[];
      if (!states?.length) {
        return new Response(JSON.stringify({ error: "No states provided" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase.from("state_laws").upsert(states, { onConflict: "state_code" }).select();
      return new Response(JSON.stringify(error ? { error } : data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
