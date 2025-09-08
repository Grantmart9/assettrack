// src/components/WesternCapeMap.tsx
/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { motion } from "framer-motion";

type Asset = {
  /** Unique id – useful if you later fetch real data */
  id: string | number;
  /** Latitude of the asset */
  lat: number;
  /** Longitude of the asset */
  lng: number;
  /** Optional label shown in the tooltip */
  label?: string;
};

type WesternCapeMapProps = {
  /** Tailwind / custom classNames applied to the map container */
  className?: string;
  /** Zoom level (default 8) – increase to focus more on Cape Town */
  zoom?: number;
  /** Optional list of asset locations to pin on the map */
  assets?: Asset[];
};

/**
 * A reusable Google‑Maps component that
 *   • centres on the Western Cape (South Africa)
 *   • animates in with Framer Motion
 *   • displays a marker for every asset in `assets`
 *
 * Example:
 *   <WesternCapeMap
 *     className="rounded-xl shadow-lg"
 *     zoom={9}
 *     assets={[
 *       { id: 1, lat: -33.9, lng: 18.4, label: "Truck #1" },
 *       { id: 2, lat: -34.2, lng: 18.9, label: "Van #2" },
 *     ]}
 *   />
 */
export function WesternCapeMap({
  className = "",
  zoom = 8,
  assets,
}: WesternCapeMapProps) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  /* --------------------------------------------------------------
     Fake data – used only when the caller does not provide `assets`.
     Replace / remove this constant in production.
  -------------------------------------------------------------- */
  const demoAssets: Asset[] = [
    { id: "a1", lat: -33.9249, lng: 18.4241, label: "Cape Town Hub" },
    { id: "a2", lat: -34.05, lng: 18.6, label: "Hydrualic Drill" },
    { id: "a3", lat: -34.35, lng: 19.0, label: "Multimeter" },
    { id: "a4", lat: -34.8, lng: 20.0, label: "Mossel Bay Site" },
    { id: "a5", lat: -34.2, lng: 19.6, label: "Laptop" },
  ];
  const assetList = assets ?? demoAssets;

  /* --------------------------------------------------------------
     Initialise the Google Map (once)
  -------------------------------------------------------------- */
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error(
        "❌ Google Maps API key not found. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local"
      );
      return;
    }

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        if (!mapDiv.current) return;

        const centre = { lat: -33.9249, lng: 18.4241 }; // Cape Town approx.

        const options: google.maps.MapOptions = {
          center: centre,
          zoom,
          mapTypeId: "roadmap",
          // optional province‑level restriction
          restriction: {
            latLngBounds: {
              north: -30.9,
              south: -35.5,
              east: 22.0,
              west: 15.5,
            },
            strictBounds: false,
          },
          disableDefaultUI: false,
          zoomControl: true,
        };

        const map = new google.maps.Map(mapDiv.current, options);
        setMapInstance(map);
      })
      .catch((e) => console.error("❌ Google Maps failed to load:", e));

    // cleanup ONLY the map object – markers are cleared separately below
    return () => {
      setMapInstance(null);
    };
  }, [zoom]); // zoom change re‑creates the map (rarely needed)

  /* --------------------------------------------------------------
     Whenever the map is ready OR the asset list changes, (re)draw markers
  -------------------------------------------------------------- */
  useEffect(() => {
    if (!mapInstance) return;

    // ---- 1️⃣ Remove any previous markers ----
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // ---- 2️⃣ Add a marker for each asset ----
    assetList.forEach((asset) => {
      const marker = new google.maps.Marker({
        position: { lat: asset.lat, lng: asset.lng },
        map: mapInstance,
        title: asset.label ?? `Asset ${asset.id}`,
        // Uncomment the next line to use a custom SVG/icon instead of the default red pin
        // icon: "/assets/pin.svg",
      });

      // Optional tooltip / InfoWindow
      if (asset.label) {
        const info = new google.maps.InfoWindow({
          content: `<div class="p-2 text-sm font-medium">${asset.label}</div>`,
        });

        marker.addListener("click", () => info.open(mapInstance, marker));
      }

      markersRef.current.push(marker);
    });
  }, [mapInstance, assetList]); // re‑run when map is ready or assets change

  /* --------------------------------------------------------------
     Cleanup on component unmount – remove markers & listeners
  -------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, []);

  /* --------------------------------------------------------------
     Render – Framer‑Motion wrapper + Tailwind container
  -------------------------------------------------------------- */
  return (
    <motion.div
      ref={mapDiv}
      className={`h-auto w-full ${className}`} // Tailwind: 384 px height, full width
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  );
}
