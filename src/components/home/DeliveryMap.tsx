import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

// Convert lat/lng to 3D position on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

interface ZoneData {
  id: string;
  name: string;
  abbr: string;
  type: "delivery" | "shipping";
  description: string;
  hours: string;
  service: string;
  eta: string;
  center: { lat: number; lng: number };
  points: { lat: number; lng: number }[];
  color: string;
}

const zones: ZoneData[] = [
  {
    id: "dc",
    name: "Washington D.C.",
    abbr: "DC",
    type: "delivery",
    description: "All quadrants — NW, NE, SW, SE, and downtown corridors. Our fastest service zone.",
    hours: "Mon–Sat: 8am – 9:30pm · Sun: 10am – 8pm",
    service: "Express hand-delivery",
    eta: "Under 1 hour",
    center: { lat: 38.9, lng: -77.03 },
    points: [
      { lat: 39.0, lng: -77.12 }, { lat: 39.0, lng: -76.91 },
      { lat: 38.79, lng: -76.91 }, { lat: 38.79, lng: -77.12 },
    ],
    color: "#4ade80",
  },
  {
    id: "md",
    name: "Maryland",
    abbr: "MD",
    type: "delivery",
    description: "Baltimore, Annapolis, Silver Spring, Bethesda, Columbia, and surrounding areas.",
    hours: "Mon–Sat: 8am – 9:30pm · Sun: 10am – 8pm",
    service: "Same-day hand-delivery",
    eta: "1 – 3 hours",
    center: { lat: 39.15, lng: -76.7 },
    points: [
      { lat: 39.72, lng: -79.5 }, { lat: 39.72, lng: -75.05 },
      { lat: 38.02, lng: -75.05 }, { lat: 38.02, lng: -75.7 },
      { lat: 38.3, lng: -76.0 }, { lat: 38.45, lng: -76.4 },
      { lat: 38.8, lng: -77.2 }, { lat: 39.0, lng: -77.5 },
      { lat: 39.35, lng: -77.7 }, { lat: 39.6, lng: -77.8 },
      { lat: 39.72, lng: -78.0 }, { lat: 39.72, lng: -79.5 },
    ],
    color: "#22c55e",
  },
  {
    id: "va",
    name: "Virginia",
    abbr: "VA",
    type: "delivery",
    description: "Northern Virginia including Arlington, Alexandria, Fairfax, Loudoun, and Prince William County.",
    hours: "Mon–Sat: 8am – 9:30pm · Sun: 10am – 8pm",
    service: "Same-day hand-delivery",
    eta: "1 – 3 hours",
    center: { lat: 38.2, lng: -78.0 },
    points: [
      { lat: 39.35, lng: -77.7 }, { lat: 39.0, lng: -78.0 },
      { lat: 38.0, lng: -79.5 }, { lat: 36.54, lng: -83.67 },
      { lat: 36.54, lng: -75.5 }, { lat: 37.0, lng: -76.0 },
      { lat: 37.6, lng: -76.3 }, { lat: 38.02, lng: -76.5 },
      { lat: 38.45, lng: -77.0 }, { lat: 38.8, lng: -77.2 },
    ],
    color: "#16a34a",
  },
  {
    id: "ny",
    name: "New York",
    abbr: "NY",
    type: "shipping",
    description: "NYC metro, Long Island, Westchester, and upstate. Premium discreet packaging.",
    hours: "Orders placed by 2pm ship same day",
    service: "Priority shipping",
    eta: "1 – 2 business days",
    center: { lat: 41.0, lng: -74.5 },
    points: [
      { lat: 42.5, lng: -79.76 }, { lat: 42.5, lng: -73.0 },
      { lat: 40.5, lng: -72.0 }, { lat: 40.5, lng: -74.0 },
      { lat: 41.0, lng: -74.8 }, { lat: 42.0, lng: -79.76 },
    ],
    color: "#a78bfa",
  },
  {
    id: "nj",
    name: "New Jersey",
    abbr: "NJ",
    type: "shipping",
    description: "Full state coverage. Newark, Jersey City, Trenton, Atlantic City, and all counties.",
    hours: "Orders placed by 2pm ship same day",
    service: "Priority shipping",
    eta: "1 – 2 business days",
    center: { lat: 40.1, lng: -74.5 },
    points: [
      { lat: 41.36, lng: -74.7 }, { lat: 41.36, lng: -73.9 },
      { lat: 39.5, lng: -74.0 }, { lat: 38.93, lng: -74.9 },
      { lat: 39.5, lng: -75.56 }, { lat: 40.2, lng: -74.8 },
    ],
    color: "#8b5cf6",
  },
  {
    id: "pa",
    name: "Pennsylvania",
    abbr: "PA",
    type: "shipping",
    description: "Philadelphia, Pittsburgh, Harrisburg, and statewide. White-glove shipping standards.",
    hours: "Orders placed by 2pm ship same day",
    service: "Standard shipping",
    eta: "2 – 3 business days",
    center: { lat: 40.8, lng: -77.5 },
    points: [
      { lat: 42.27, lng: -80.52 }, { lat: 42.0, lng: -75.0 },
      { lat: 39.72, lng: -75.05 }, { lat: 39.72, lng: -76.0 },
      { lat: 39.9, lng: -76.5 }, { lat: 39.72, lng: -79.5 },
      { lat: 40.0, lng: -80.52 },
    ],
    color: "#7c3aed",
  },
];

// Natural Earth globe — green land, blue ocean
function Earth() {
  const texture = useLoader(THREE.TextureLoader, "/textures/earth.jpg");
  const bumpMap = useLoader(THREE.TextureLoader, "/textures/earth-bump.png");

  return (
    <Sphere args={[2, 64, 64]}>
      <meshStandardMaterial
        map={texture}
        bumpMap={bumpMap}
        bumpScale={0.05}
        roughness={0.6}
        metalness={0.1}
      />
    </Sphere>
  );
}

// Blue atmosphere glow
function Atmosphere() {
  return (
    <>
      <Sphere args={[2.04, 64, 64]}>
        <meshBasicMaterial
          color="#1e40af"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>
      <Sphere args={[2.15, 64, 64]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  );
}

// Zone marker — consistent dot style for service areas (green for delivery, purple for shipping)
function ZoneMarker({
  zone,
  isActive,
  onClick,
}: {
  zone: ZoneData;
  isActive: boolean;
  onClick: () => void;
}) {
  const dotPos = useMemo(
    () => latLngToVector3(zone.center.lat, zone.center.lng, 2.02),
    [zone]
  );
  const labelPos = useMemo(
    () => latLngToVector3(zone.center.lat, zone.center.lng, 2.07),
    [zone]
  );

  const dotColor = zone.type === "delivery" ? "#22c55e" : "#8b5cf6";

  return (
    <group>
      <mesh
        position={dotPos}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[0.001, 4, 4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <Html position={labelPos} center>
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          <span
            className={`text-[10px] font-sans font-bold whitespace-nowrap text-center ${isActive ? "scale-125" : ""}`}
            style={{
              color: dotColor,
              textShadow: `0 0 6px ${dotColor}88, 0 0 3px rgba(0,0,0,0.9)`,
            }}
          >
            {zone.abbr}
          </span>
          <span
            className="text-[6px] font-sans uppercase whitespace-nowrap text-center"
            style={{
              color: dotColor,
              opacity: 0.7,
              textShadow: "0 0 4px rgba(0,0,0,0.9)",
            }}
          >
            {zone.type}
          </span>
        </div>
      </Html>
    </group>
  );
}

// All US states with approximate center coordinates
const serviceStateIds = new Set(["dc", "md", "va", "ny", "nj", "pa"]);

const allUSStates: { abbr: string; lat: number; lng: number }[] = [
  { abbr: "AL", lat: 32.8, lng: -86.8 },
  { abbr: "AK", lat: 64.2, lng: -152.5 },
  { abbr: "AZ", lat: 34.0, lng: -111.1 },
  { abbr: "AR", lat: 35.0, lng: -92.4 },
  { abbr: "CA", lat: 36.8, lng: -119.4 },
  { abbr: "CO", lat: 39.1, lng: -105.4 },
  { abbr: "CT", lat: 41.6, lng: -72.7 },
  { abbr: "DE", lat: 39.0, lng: -75.5 },
  { abbr: "FL", lat: 27.8, lng: -81.8 },
  { abbr: "GA", lat: 32.7, lng: -83.5 },
  { abbr: "HI", lat: 19.9, lng: -155.6 },
  { abbr: "ID", lat: 44.1, lng: -114.7 },
  { abbr: "IL", lat: 40.3, lng: -89.0 },
  { abbr: "IN", lat: 40.3, lng: -86.1 },
  { abbr: "IA", lat: 42.0, lng: -93.2 },
  { abbr: "KS", lat: 38.5, lng: -98.8 },
  { abbr: "KY", lat: 37.8, lng: -84.3 },
  { abbr: "LA", lat: 30.9, lng: -92.0 },
  { abbr: "ME", lat: 45.3, lng: -69.4 },
  { abbr: "MA", lat: 42.4, lng: -71.4 },
  { abbr: "MI", lat: 44.3, lng: -85.6 },
  { abbr: "MN", lat: 46.4, lng: -94.6 },
  { abbr: "MS", lat: 32.7, lng: -89.7 },
  { abbr: "MO", lat: 38.5, lng: -91.8 },
  { abbr: "MT", lat: 46.8, lng: -110.4 },
  { abbr: "NE", lat: 41.1, lng: -99.7 },
  { abbr: "NV", lat: 38.8, lng: -116.4 },
  { abbr: "NH", lat: 43.2, lng: -71.6 },
  { abbr: "NM", lat: 34.8, lng: -106.2 },
  { abbr: "NC", lat: 35.6, lng: -79.8 },
  { abbr: "ND", lat: 47.5, lng: -100.5 },
  { abbr: "OH", lat: 40.4, lng: -82.9 },
  { abbr: "OK", lat: 35.0, lng: -97.1 },
  { abbr: "OR", lat: 43.8, lng: -120.6 },
  { abbr: "RI", lat: 41.6, lng: -71.5 },
  { abbr: "SC", lat: 34.0, lng: -81.0 },
  { abbr: "SD", lat: 43.9, lng: -99.9 },
  { abbr: "TN", lat: 35.5, lng: -86.6 },
  { abbr: "TX", lat: 31.1, lng: -97.6 },
  { abbr: "UT", lat: 39.3, lng: -111.1 },
  { abbr: "VT", lat: 44.0, lng: -72.7 },
  { abbr: "WA", lat: 47.4, lng: -120.7 },
  { abbr: "WV", lat: 38.5, lng: -80.5 },
  { abbr: "WI", lat: 43.8, lng: -89.5 },
  { abbr: "WY", lat: 43.1, lng: -107.6 },
];

// State marker with dark red 3D dot + centered white label
function StateMarker({ abbr, lat, lng }: { abbr: string; lat: number; lng: number }) {
  const dotPos = useMemo(() => latLngToVector3(lat, lng, 2.02), [lat, lng]);
  const labelPos = useMemo(() => latLngToVector3(lat, lng, 2.07), [lat, lng]);

  return (
    <group>
      <Html position={labelPos} center style={{ pointerEvents: "none" }}>
        <div className="flex items-center justify-center">
          <span
            className="text-[9px] font-sans font-bold whitespace-nowrap text-center"
            style={{
              color: "#dc2626",
              textShadow: "0 0 4px rgba(220,38,38,0.4), 0 0 3px rgba(0,0,0,0.9)",
            }}
          >
            {abbr}
          </span>
        </div>
      </Html>
    </group>
  );
}

// Pulsing city dot
function CityDot({ lat, lng, delay = 0, label }: { lat: number; lng: number; delay?: number; label: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLngToVector3(lat, lng, 2.025), [lat, lng]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = (clock.getElapsedTime() + delay) % 3;
      const scale = 1 + Math.sin(t * Math.PI * 0.66) * 0.3;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <mesh ref={ref} position={pos}>
        <sphereGeometry args={[0.001, 4, 4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <Html position={latLngToVector3(lat, lng, 2.06)} center style={{ pointerEvents: "none" }}>
        <span
          className="text-[6px] font-sans text-white/50 whitespace-nowrap"
          style={{ textShadow: "0 0 4px rgba(0,0,0,0.9)" }}
        >
          {label}
        </span>
      </Html>
    </group>
  );
}

// Globe scene — camera positioned to show east coast US on load
function GlobeScene({
  activeZone,
  onZoneClick,
}: {
  activeZone: string | null;
  onZoneClick: (id: string) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <pointLight position={[-3, -2, 4]} intensity={0.3} color="#3b82f6" />
      <pointLight position={[2, 1, 3]} intensity={0.2} color="#ffffff" />

      <Earth />
      <Atmosphere />

      {/* Service zone markers (consistent dot style) */}
      {zones.map((zone) => (
        <ZoneMarker
          key={zone.id}
          zone={zone}
          isActive={activeZone === zone.id}
          onClick={() => onZoneClick(zone.id)}
        />
      ))}

      {/* All other US state markers with red dots */}
      {allUSStates
        .filter((s) => !serviceStateIds.has(s.abbr.toLowerCase()))
        .map((s) => (
          <StateMarker key={`state-${s.abbr}`} abbr={s.abbr} lat={s.lat} lng={s.lng} />
        ))}

      {/* City markers */}
      <CityDot lat={38.9} lng={-77.03} delay={0} label="Washington" />
      <CityDot lat={39.29} lng={-76.61} delay={0.7} label="Baltimore" />
      <CityDot lat={38.88} lng={-77.17} delay={1.4} label="Arlington" />
      <CityDot lat={40.71} lng={-74.01} delay={0.3} label="New York" />
      <CityDot lat={39.95} lng={-75.17} delay={1.0} label="Philadelphia" />

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={2.8}
        maxDistance={10}
        autoRotate={false}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

// Main component
const DeliveryMap = () => {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  const activeZone = zones.find((z) => z.id === activeZoneId) ?? null;

  const handleZoneClick = useCallback((id: string) => {
    setActiveZoneId((prev) => (prev === id ? null : id));
  }, []);

  // Camera position: zoomed in on east coast US (DC area roughly lat 39, lng -77)
  // Converted to 3D: the camera looks at the globe from the angle showing the US east coast
  const cameraPosition = useMemo(() => {
    const lat = 30;
    const lng = -95;
    const distance = 6;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(distance * Math.sin(phi) * Math.cos(theta));
    const z = distance * Math.sin(phi) * Math.sin(theta);
    const y = distance * Math.cos(phi);
    return [x, y, z] as [number, number, number];
  }, []);

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <p className="text-xs font-sans uppercase editorial-spacing text-muted-foreground mb-4">
            Service Area
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground">
            Where We Deliver
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
            {/* 3D Globe */}
            <div className="relative w-full lg:w-3/5 aspect-square max-w-[320px] sm:max-w-[420px] lg:max-w-[520px] mx-auto lg:mx-0 overflow-hidden">
              <Canvas
                camera={{ position: cameraPosition, fov: 40 }}
                style={{ background: "transparent" }}
                gl={{ antialias: true, alpha: true }}
              >
                <GlobeScene
                  activeZone={activeZoneId}
                  onZoneClick={handleZoneClick}
                />
              </Canvas>

              {/* Ambient blue glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-blue-900/[0.06] blur-[60px]" />
              </div>
            </div>

            {/* Info panel + zone list */}
            <div className="w-full lg:w-2/5 min-h-[300px]">
              {/* Legend */}
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                  <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground">
                    Delivery
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#8b5cf6" }} />
                  <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground">
                    Postal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#dc2626" }} />
                  <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground">
                    No Service
                  </span>
                </div>
              </div>

              {/* Active zone detail */}
              <AnimatePresence mode="wait">
                {activeZone ? (
                  <motion.div
                    key={activeZone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                  >
                    <span
                      className="inline-block text-[10px] font-sans uppercase editorial-spacing px-3 py-1 mb-4"
                      style={{
                        backgroundColor: activeZone.type === "delivery" ? "rgba(34,197,94,0.1)" : "rgba(139,92,246,0.1)",
                        color: activeZone.type === "delivery" ? "#22c55e" : "#a78bfa",
                      }}
                    >
                      {activeZone.type === "delivery" ? "● Same-Day Delivery" : "○ Postal Shipping"}
                    </span>

                    <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
                      {activeZone.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-6">
                      {activeZone.description}
                    </p>

                    <div className="space-y-3 border-t border-border/30 pt-5">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground">Service</span>
                        <span className="text-xs font-sans text-foreground/80">{activeZone.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground">ETA</span>
                        <span className="text-xs font-sans text-foreground/80">{activeZone.eta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground">Hours</span>
                        <span className="text-xs font-sans text-foreground/80">{activeZone.hours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground">ID</span>
                        <span className="text-xs font-sans text-foreground/80">21+ Government ID</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-8"
                  >
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                      Click a zone on the globe or from the list below to see service details.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Always-visible zone list */}
              <div>
                <p className="text-[10px] font-sans uppercase editorial-spacing text-muted-foreground mb-3">
                  All Zones
                </p>
                <div className="space-y-1.5">
                  {zones.map((z) => (
                    <button
                      key={z.id}
                      onClick={() => setActiveZoneId(activeZoneId === z.id ? null : z.id)}
                      className={`w-full flex items-center justify-between py-2.5 px-3 text-left border transition-all duration-300 group ${
                        activeZoneId === z.id
                          ? "border-foreground/30 bg-foreground/5"
                          : "border-border/20 hover:border-foreground/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: z.color }}
                        />
                        <span className={`text-xs font-sans transition-colors ${
                          activeZoneId === z.id ? "text-foreground" : "text-foreground/60 group-hover:text-foreground"
                        }`}>
                          {z.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-sans text-muted-foreground/50">{z.eta}</span>
                        <span
                          className="text-[9px] font-sans uppercase editorial-spacing"
                          style={{ color: z.type === "delivery" ? "#22c55e" : "#a78bfa", opacity: 0.7 }}
                        >
                          {z.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DeliveryMap;
