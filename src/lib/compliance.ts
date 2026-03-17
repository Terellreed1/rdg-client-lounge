import { supabase } from "@/integrations/supabase/client";

export interface StateCompliance {
  state_code: string;
  state_name: string;
  legal_status: string;
  can_ship: boolean;
  can_deliver: boolean;
  shipping_fee: number;
  estimated_days: number;
  min_age: number;
  notes: string | null;
}

export interface ServiceArea {
  id: string;
  name: string;
  zip_codes: string[];
  delivery_fee: number;
  estimated_time_minutes: number;
  is_active: boolean;
}

export interface ComplianceCheckResult {
  canServe: boolean;
  method: "local" | "shipping" | "both" | "none";
  restrictions: string[];
  shipping?: {
    fee: number;
    days: number;
    available: boolean;
  };
  local?: {
    available: boolean;
    fee?: number;
    serviceArea?: string;
    estimatedMinutes?: number;
  };
  stateCompliance?: StateCompliance;
}

// Simple in-memory cache
let stateCache: StateCompliance[] | null = null;
let stateCacheTime = 0;
let areaCache: ServiceArea[] | null = null;
let areaCacheTime = 0;
const STATE_TTL = 60 * 60 * 1000; // 1 hour
const AREA_TTL = 10 * 60 * 1000; // 10 minutes

// US state name → code mapping
const STATE_NAME_MAP: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
  montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND",
  ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI",
  "south carolina": "SC", "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT",
  vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY", "district of columbia": "DC", "washington d.c.": "DC", "washington dc": "DC",
};

function normalizeState(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length <= 2) return trimmed.toUpperCase();
  return STATE_NAME_MAP[trimmed.toLowerCase()] || trimmed.toUpperCase();
}

async function getStates(): Promise<StateCompliance[]> {
  if (stateCache && Date.now() - stateCacheTime < STATE_TTL) return stateCache;
  const { data } = await supabase
    .from("state_laws")
    .select("state_code, state_name, legal_status, can_ship, can_deliver, shipping_fee, estimated_days, min_age, notes")
    .eq("active", true);
  stateCache = (data as unknown as StateCompliance[]) || [];
  stateCacheTime = Date.now();
  return stateCache;
}

async function getServiceAreas(): Promise<ServiceArea[]> {
  if (areaCache && Date.now() - areaCacheTime < AREA_TTL) return areaCache;
  const { data } = await supabase
    .from("service_areas")
    .select("*")
    .eq("is_active", true);
  areaCache = (data as unknown as ServiceArea[]) || [];
  areaCacheTime = Date.now();
  return areaCache;
}

export async function checkAddress(state: string, zip?: string): Promise<ComplianceCheckResult> {
  const stateCode = normalizeState(state);
  const states = await getStates();
  const stateData = states.find((s) => s.state_code === stateCode);

  if (!stateData) {
    return { canServe: false, method: "none", restrictions: [`Unknown state: ${state}`] };
  }

  if (stateData.legal_status === "illegal") {
    return {
      canServe: false,
      method: "none",
      restrictions: ["Cannabis is not legal in this state"],
      stateCompliance: stateData,
    };
  }

  const restrictions: string[] = [];
  let localAvailable = false;
  let localFee = 0;
  let localArea = "";
  let localMinutes = 0;

  // Check ZIP-based local delivery
  if (stateData.can_deliver && zip) {
    const areas = await getServiceAreas();
    const match = areas.find((a) => a.zip_codes.includes(zip));
    if (match) {
      localAvailable = true;
      localFee = match.delivery_fee;
      localArea = match.name;
      localMinutes = match.estimated_time_minutes;
    }
  }

  const shippingAvailable = stateData.can_ship;

  if (!shippingAvailable && !localAvailable) {
    restrictions.push("No delivery or shipping available for this location");
  }

  const method = localAvailable && shippingAvailable
    ? "both"
    : localAvailable
      ? "local"
      : shippingAvailable
        ? "shipping"
        : "none";

  return {
    canServe: method !== "none",
    method,
    restrictions,
    shipping: shippingAvailable
      ? { fee: stateData.shipping_fee, days: stateData.estimated_days, available: true }
      : undefined,
    local: localAvailable
      ? { available: true, fee: localFee, serviceArea: localArea, estimatedMinutes: localMinutes }
      : stateData.can_deliver
        ? { available: false }
        : undefined,
    stateCompliance: stateData,
  };
}

export function extractStateFromAddress(address: string): string | null {
  // Try to find a 2-letter state code pattern
  const match = address.match(/,\s*([A-Z]{2})\s+\d{5}/);
  if (match) return match[1];
  // Try state name
  for (const [name, code] of Object.entries(STATE_NAME_MAP)) {
    if (address.toLowerCase().includes(name)) return code;
  }
  return null;
}

export function extractZipFromAddress(address: string): string | null {
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : null;
}

export function invalidateCache() {
  stateCache = null;
  areaCache = null;
}

export async function getAllStates(): Promise<StateCompliance[]> {
  return getStates();
}
