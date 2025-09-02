"use client";

import { useEffect } from "react";

export default function LeafletCSS() {
  useEffect(() => {
    // Import Leaflet CSS only on client side
    if (typeof window !== "undefined") {
      // Load Leaflet CSS dynamically
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      // Fix for default markers in React Leaflet
      // Use dynamic import with proper error handling
      const loadLeaflet = async () => {
        try {
          const L = await import(/* webpackChunkName: "leaflet" */ "leaflet");
          const leaflet = L.default || L;
          delete (leaflet as any).Icon.Default.prototype._getIconUrl;
          (leaflet as any).Icon.Default.mergeOptions({
            iconRetinaUrl: "/marker-icon-2x.svg",
            iconUrl: "/marker-icon.svg",
            shadowUrl: "/marker-shadow.svg",
          });
        } catch (error) {
          console.warn('Failed to load Leaflet:', error);
        }
      };

      loadLeaflet();
    }
  }, []);

  return null;
}