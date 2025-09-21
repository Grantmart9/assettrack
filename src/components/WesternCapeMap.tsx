/**
 * WesternCapeMap component for the AssetTrack application.
 * Renders a Google Map centered on Western Cape, South Africa.
 * Supports pinning assets with markers and tooltips.
 * Handles API key loading, restrictions to province, animations with framer-motion.
 *
 * Features:
 * - Centers on Cape Town approx. lat/lng
 * - Optional zoom and asset pins with labels
 * - Province bounds restriction
 * - Cleanup on unmount
 * - Error handling for API key/missing
 *
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { motion } from "framer-motion";

/**
 * Type for asset location data - used for map markers
 */
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

/**
 * Props for WesternCapeMap component
 */
type WesternCapeMapProps = {
  /** Tailwind / custom classNames applied to the map container */
  className?: string;
  /** Zoom level (default 8) – increase to focus more on Cape Town */
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
  zoom = 2,
  assets,
}: WesternCapeMapProps) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const assetList = assets ?? [];

  /* --------------------------------------------------------------
     Initialise the Google Map (once)
  -------------------------------------------------------------- */
  /**
   * useEffect - initializes Google Map on mount or zoom change.
   * Loads API with key from env, creates map with options (center, zoom, restriction to Western Cape).
   * Catches load errors.
   * Cleanup: nulls map instance.
   */
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

        const centre = { lat: -33.922121415702016, lng: 18.6861007556373 }; // Cape Town approx.

        const options: google.maps.MapOptions = {
          center: centre,
          zoom,
          mapTypeId: "roadmap",
          // Optional province-level restriction to Western Cape bounds
          restriction: {
            latLngBounds: {
              north: -25.9,
              south: -35.5,
              east: 21.0,
              west: 13.5,
            },
            strictBounds: false,
          },
          disableDefaultUI: false,
          zoomControl: false,
        };

        const map = new google.maps.Map(mapDiv.current, options);
        setMapInstance(map);
      })
      .catch((e) => console.error("❌ Google Maps failed to load:", e));

    // Cleanup: only null map instance (markers cleaned separately)
    return () => {
      setMapInstance(null);
    };
  }, [zoom]); // Re-run on zoom change (rare)

  /* --------------------------------------------------------------
     Whenever the map is ready OR the asset list changes, (re)draw markers
  -------------------------------------------------------------- */
  /**
   * useEffect - adds/removes markers when map ready or assets change.
   * Clears previous markers, adds new ones with positions, titles, optional InfoWindow on click.
   * Supports custom icon uncomment.
   */
  useEffect(() => {
    if (!mapInstance) return;

    // 1. Remove any previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 2. Add a marker for each asset
    assetList.forEach((asset) => {
      const marker = new google.maps.Marker({
        position: { lat: asset.lat, lng: asset.lng },
        map: mapInstance,
        title: asset.label ?? `Asset ${asset.id}`,
        // Uncomment the next line to use a custom SVG/icon instead of the default red pin
        // icon: "/assets/pin.svg",
      });

      // Optional tooltip / InfoWindow for labeled assets
      if (asset.label) {
        const info = new google.maps.InfoWindow({
          content: `<div class="p-2 text-sm font-medium">${asset.label}</div>`,
        });

        marker.addListener("click", () => info.open(mapInstance, marker));
      }

      markersRef.current.push(marker);
    });
  }, [mapInstance, assetList]); // Re-run when map ready or assets change

  /* --------------------------------------------------------------
     Cleanup on component unmount – remove markers & listeners
  -------------------------------------------------------------- */
  /**
   * useEffect - cleanup on unmount: removes all markers from map.
   */
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, []);

  /* --------------------------------------------------------------
     Render – Framer‑Motion wrapper + Tailwind container
  -------------------------------------------------------------- */
  // Render - framer-motion animated div as map container
  return (
    <motion.div
      ref={mapDiv}
      className={`h-auto w-full ${className}`} // Tailwind: auto height, full width + props class
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  );
}
