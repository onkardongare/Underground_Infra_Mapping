// components/map/buildProjectGeoJSON.ts
import type { Project } from "@/store/slices/projectSlice";
import type { MapLayer } from "@slices/mapSlice";

export function buildProjectFeatures(
  projects: Project[],
  selectedLayers: MapLayer[]
): GeoJSON.Feature[] {
  const features: GeoJSON.Feature[] = [];

  const filtered = projects.filter((p) => {
    if (!p.geometry) return false;
    if (!selectedLayers.length) return false;
    if (!p.utilityType) return false;
    return selectedLayers.includes(p.utilityType as MapLayer);
  });

  filtered.forEach((p) => {
    if (!p.geometry) return;

    // main feature
    features.push({
      type: "Feature",
      properties: {
        id: p.id,
        name: p.name,
        status: p.status,
        approved: p.approved,
        utilityType: p.utilityType,
        featureType: "project",
      },
      geometry: p.geometry as any,
    });

    if (p.geometry.type === "LineString") {
      const coords = p.geometry.coordinates as [number, number][];
      if (coords.length >= 2) {
        const start = coords[0];
        const end = coords[coords.length - 1];

        features.push({
          type: "Feature",
          properties: {
            id: p.id,
            featureType: "endpoint",
            endpoint: "start",
            name: p.name,
          },
          geometry: { type: "Point", coordinates: start } as any,
        });

        features.push({
          type: "Feature",
          properties: {
            id: p.id,
            featureType: "endpoint",
            endpoint: "end",
            name: p.name,
          },
          geometry: { type: "Point", coordinates: end } as any,
        });
      }
    }
  });

  return features;
}
