// components/map/ProjectMiniMap.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { Project } from "@/store/slices/projectSlice";

const SOURCE_ID = "project-detail";

interface ProjectMiniMapProps {
  project: Project;
}

export default function ProjectMiniMap({ project }: ProjectMiniMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const geometry = project.geometry;

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const m = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [78.9629, 20.5937], // fallback: India center
      zoom: 4,
      attributionControl: false,
      interactive: false, // mini-map is display only
    });

    mapRef.current = m;

    m.on("load", () => {
      m.addSource(SOURCE_ID, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // line / polygon
      m.addLayer({
        id: "project-detail-line",
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#2563eb",
          "line-width": 2,
        },
      });

      m.addLayer({
        id: "project-detail-fill",
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.25,
        },
        filter: ["==", "$type", "Polygon"],
      });

      // endpoints for line
      m.addLayer({
        id: "project-detail-endpoints",
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": 3,
          "circle-color": "#0f172a",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
        },
        filter: ["==", "featureType", "endpoint"],
      });

      setIsLoaded(true);
    });

    return () => {
      m.remove();
      mapRef.current = null;
    };
  }, []);

  // update data + fit view when geometry changes / map loaded
  useEffect(() => {
    if (!isLoaded || !geometry || !mapRef.current) return;
    const m = mapRef.current;
    const source = m.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const features: GeoJSON.Feature[] = [];

    // main feature
    const mainFeature: GeoJSON.Feature = {
      type: "Feature",
      properties: {
        id: project.id,
        name: project.name,
      },
      geometry: geometry as any,
    };
    features.push(mainFeature);

    // endpoints (for LineString only)
    if (geometry.type === "LineString") {
      const coords = geometry.coordinates as [number, number][];
      if (coords.length >= 2) {
        const start = coords[0];
        const end = coords[coords.length - 1];

        features.push({
          type: "Feature",
          properties: {
            featureType: "endpoint",
            endpoint: "start",
          },
          geometry: { type: "Point", coordinates: start } as any,
        });

        features.push({
          type: "Feature",
          properties: {
            featureType: "endpoint",
            endpoint: "end",
          },
          geometry: { type: "Point", coordinates: end } as any,
        });
      }
    }

    source.setData({
      type: "FeatureCollection",
      features,
    } as GeoJSON.FeatureCollection);

    // fit bounds / center
    if (geometry.type === "Point") {
      const [lng, lat] = geometry.coordinates as [number, number];
      m.setCenter([lng, lat]);
      m.setZoom(15);
    } else {
      const coords = collectCoords(geometry);
      if (!coords.length) return;

      const bounds = coords.reduce((b, [lng, lat]) => {
        return b.extend([lng, lat]);
      }, new maplibregl.LngLatBounds(coords[0], coords[0]));

      m.fitBounds(bounds, { padding: 24, maxZoom: 16 });
    }
  }, [geometry, isLoaded, project.id, project.name]);

  // helper: flatten coordinates for LineString/Polygon/Multi*
  function collectCoords(
    geom: Project["geometry"]
  ): [number, number][] {
    if (!geom) return [];
    const coords: [number, number][] = [];

    const walk = (g: any) => {
      if (g.type === "Point") {
        coords.push(g.coordinates as [number, number]);
      } else if (g.type === "LineString" || g.type === "MultiPoint") {
        g.coordinates.forEach((c: [number, number]) => coords.push(c));
      } else if (g.type === "Polygon" || g.type === "MultiLineString") {
        g.coordinates.flat().forEach((c: [number, number]) => coords.push(c));
      } else if (g.type === "MultiPolygon") {
        g.coordinates.flat(2).forEach((c: [number, number]) => coords.push(c));
      }
    };

    walk(geom);
    return coords;
  }

  if (!geometry) {
    return (
      <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
        Location not available for this project.
      </div>
    );
  }

  return (
    <div className="h-56 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
