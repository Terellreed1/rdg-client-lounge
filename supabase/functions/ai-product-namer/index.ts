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

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "") || null;
  const isAdmin = await verifyAdmin(supabase, token);

  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { image_urls } = await req.json();

    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      return new Response(JSON.stringify({ error: "No image URLs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process in batches of 5 to avoid overwhelming the AI
    const results: { image_url: string; name: string; brand: string; product_type: string; description: string }[] = [];
    const batchSize = 5;

    for (let i = 0; i < image_urls.length; i += batchSize) {
      const batch = image_urls.slice(i, i + batchSize);

      const prompt = `You are a cannabis product naming expert for a luxury dispensary called "Luxury Courier Club". 
      
Analyze these product images and suggest creative, premium-sounding names. For each image URL, return a JSON array with objects containing:
- name: A creative, catchy product name (2-4 words)
- brand: Best guess brand from this list or "Luxury Courier Club" if unsure: ${JSON.stringify(["Luxury Courier Club", "The Candy Shop", "Pain Network", "Grumpus", "Cupz Strainz", "Julato NYC", "High Mart", "Highflix", "High Monkey", "Mameys", "Frutaz LA", "Don Merfos", "Kandy Depo", "Always Faded", "Super Candy Bros", "Backpack Boyz", "Kush Factory", "Friday", "High Tolerance", "Cali Clouds Club"])}
- product_type: One of: Flower, Vapes, Edibles, Concentrates, Pre-Rolls, Accessories, Other
- description: A short luxury-style product description (1-2 sentences)

Image URLs to analyze:
${batch.map((url: string, idx: number) => `${idx + 1}. ${url}`).join("\n")}

IMPORTANT: Return ONLY a valid JSON array. No markdown, no code blocks, just the JSON array.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                ...batch.map((url: string) => ({
                  type: "image_url",
                  image_url: { url },
                })),
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await response.text();
        console.error("AI gateway error:", status, errText);
        throw new Error(`AI gateway error: ${status}`);
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content || "[]";

      // Parse the AI response - strip markdown code blocks if present
      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      try {
        const parsed = JSON.parse(cleaned);
        const batchResults = Array.isArray(parsed) ? parsed : [parsed];
        batch.forEach((url: string, idx: number) => {
          const suggestion = batchResults[idx] || { name: "New Product", brand: "Luxury Courier Club", product_type: "Flower", description: "" };
          results.push({ image_url: url, ...suggestion });
        });
      } catch {
        // Fallback if AI returns unparseable response
        batch.forEach((url: string) => {
          results.push({ image_url: url, name: "New Product", brand: "Luxury Courier Club", product_type: "Flower", description: "" });
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI product namer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
