// components/map/ProjectMap.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { useRouter } from "next/navigation";

import { useAppDispatch } from "@hooks/useAppDispatch";
import { useAppSelector } from "@hooks/useAppSelector";
import { setViewState } from "@slices/mapSlice";
import { selectProjects, type Project } from "@/store/slices/projectSlice";

import { buildProjectFeatures } from "./buildProjectGeoJSON";
import ProjectDetailCard from "@components/map/ProjectDetailCard";

export default function ProjectMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const viewState = useAppSelector((state) => state.map.viewState);
  const selectedLayers = useAppSelector((state) => state.map.selectedLayers);
  const projects = useAppSelector(selectProjects);
  const [mapLoaded, setMapLoaded] = useState(false);


  const projectsRef = useRef<Project[]>([]);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  const [hoverProject, setHoverProject] = useState<Project | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const lastHoverIdRef = useRef<string | null>(null);

  // init map ONCE
  useEffect(() => {
    if (!mapContainer.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      // style: "https://tiles.openfreemap.org/styles/positron",
      // style: "https://tiles.openfreemap.org/styles/bright",

      center: [viewState.lng, viewState.lat],
      zoom: viewState.zoom,
      attributionControl: false,
    });

    map.current = m;

    m.addControl(new maplibregl.NavigationControl(), "bottom-right");
    m.addControl(new maplibregl.ScaleControl(), "bottom-left");

    m.on("move", () => {
      dispatch(
        setViewState({
          lng: parseFloat(m.getCenter().lng.toFixed(4)),
          lat: parseFloat(m.getCenter().lat.toFixed(4)),
          zoom: parseFloat(m.getZoom().toFixed(2)),
        })
      );
    });

    m.on("load", () => {
      m.addSource("projects", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // line layer
      m.addLayer({
        id: "projects-line",
        type: "line",
        source: "projects",
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "approved"], true],
            "#16a34a",
            "#eab308",
          ],
          "line-width": 1.5,
        },
        filter: ["==", "featureType", "project"],
      });

      // fill layer
      m.addLayer({
        id: "projects-fill",
        type: "fill",
        source: "projects",
        paint: {
          "fill-color": [
            "case",
            ["==", ["get", "approved"], true],
            "#16a34a",
            "#eab308",
          ],
          "fill-opacity": 0.3,
        },
        filter: [
          "all",
          ["==", "$type", "Polygon"],
          ["==", "featureType", "project"],
        ],
      });

      // endpoints
      m.addLayer({
        id: "projects-endpoints",
        type: "circle",
        source: "projects",
        filter: ["==", "featureType", "endpoint"],
        paint: {
          "circle-radius": 3,
          "circle-color": "#0f172a",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
        },
      });

      // labels
      m.addLayer({
        id: "projects-labels",
        type: "symbol",
        source: "projects",
        filter: ["==", "featureType", "project"],
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#0f172a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
        },
      });

      // 🧷 HOVER → floating card
      const handleMove = (e: maplibregl.MapLayerMouseEvent) => {
        const feature = e.features && e.features[0];
        if (!feature) return;

        const id = feature.properties?.id as string | undefined;
        if (!id) return;

        const point = m.project(e.lngLat);

        if (id === lastHoverIdRef.current && hoverPos) {
          setHoverPos({ x: point.x, y: point.y });
          return;
        }

        const proj = projectsRef.current.find((p) => p.id === id);
        if (!proj) return;

        lastHoverIdRef.current = id;
        setHoverProject(proj);
        setHoverPos({ x: point.x, y: point.y });
      };

      const handleLeave = () => {
        lastHoverIdRef.current = null;
        setHoverProject(null);
        setHoverPos(null);
      };

      // 🖱 CLICK → go to /projects/[id]
      const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
        const feature = e.features && e.features[0];
        const id = feature?.properties?.id as string | undefined;
        if (!id) return;
        router.push(`/projects/${id}`);
      };

      m.on("mousemove", "projects-line", handleMove);
      m.on("mousemove", "projects-fill", handleMove);
      m.on("mouseleave", "projects-line", handleLeave);
      m.on("mouseleave", "projects-fill", handleLeave);

      m.on("click", "projects-line", handleClick);
      m.on("click", "projects-fill", handleClick);

      m.on("mouseenter", "projects-line", () => {
        m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", "projects-line", () => {
        m.getCanvas().style.cursor = "";
      });
      m.on("mouseenter", "projects-fill", () => {
        m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", "projects-fill", () => {
        m.getCanvas().style.cursor = "";
      });
      setMapLoaded(true); // ✅ tell React that source/layers exist
    });

    return () => {
      m.remove();
      map.current = null;
    };
  }, [dispatch, router]);

  // update geojson when data/layers change
  useEffect(() => {
    if (!map.current) return;
    const source = map.current.getSource("projects") as maplibregl.GeoJSONSource;
    if (!source) return;

    const features = buildProjectFeatures(projects, selectedLayers);
    source.setData({
      type: "FeatureCollection",
      features,
    } as GeoJSON.FeatureCollection);
  }, [projects, selectedLayers, mapLoaded]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      {hoverProject && hoverPos && (
        <div
          className="pointer-events-none absolute z-40"
          style={{ left: hoverPos.x + 12, top: hoverPos.y - 12 }}
        >
          <ProjectDetailCard project={hoverProject} />
        </div>
      )}
    </div>
  );
}
