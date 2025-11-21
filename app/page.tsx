"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

import Navbar from "@components/Navbar";
import Sidebar from "@components/Sidebar";
import LayerSelector from "@components/LayerSelector";

import { useAppDispatch } from "@hooks/useAppDispatch";
import { useAppSelector } from "@hooks/useAppSelector";
import {
  setViewState,
  setSelectedLayers,
  MapLayer,
} from "@slices/mapSlice";

export default function Home() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const dispatch = useAppDispatch();
  const viewState = useAppSelector((state) => state.map.viewState);
  const selectedLayers = useAppSelector((state) => state.map.selectedLayers);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Initialize MapLibre
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [viewState.lng, viewState.lat],
      zoom: viewState.zoom,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.current.addControl(new maplibregl.ScaleControl(), "bottom-left");

    map.current.on("move", () => {
      if (!map.current) return;
      dispatch(
        setViewState({
          lng: parseFloat(map.current.getCenter().lng.toFixed(4)),
          lat: parseFloat(map.current.getCenter().lat.toFixed(4)),
          zoom: parseFloat(map.current.getZoom().toFixed(2)),
        })
      );
    });
  }, [dispatch]); // run once (map.current guard prevents re-init anyway)

  // Detect desktop vs mobile/tablet
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleChange = (e: MediaQueryList | MediaQueryListEvent) => {
      const matches = "matches" in e ? e.matches : mediaQuery.matches;
      setIsDesktop(matches);
      // you chose not to auto-open on desktop, so don't call setSidebarOpen(matches)
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleMenuClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const headerHidden = isSidebarOpen && !isDesktop;

  return (
    <div className="relative flex h-screen w-full flex-col font-sans bg-slate-50">
      {/* --- Navbar overlay (top) --- */}
      <header
        className={`absolute left-0 right-0 top-0 z-30 px-2 pt-2 transition-opacity duration-300
        ${headerHidden ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <Navbar onMenuClick={handleMenuClick} />
      </header>

      {/* --- Main layout: sidebar + map --- */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          isDesktop={isDesktop}
          onMenuClick={handleSidebarClose}
        />

        {/* Map + floating UI */}
        <main className="relative flex-1 bg-slate-100">
          {/* Floating Layer Selector above zoom controls */}
          <LayerSelector
            onChange={(layers) => {
              dispatch(setSelectedLayers(layers as MapLayer[]));
              console.log("Selected layers:", layers);
              // TODO: toggle MapLibre layers here using `layers`
            }}
          />

          {/* Map container */}
          <div ref={mapContainer} className="h-full w-full" />
        </main>
      </div>
    </div>
  );
}
