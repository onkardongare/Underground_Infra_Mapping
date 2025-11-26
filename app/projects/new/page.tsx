// app/projects/new/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

// Map + draw CSS
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import {
  Home,
  ArrowLeft,
  Minus,
  Square,
  Check,
  RotateCcw,
  Trash2,
  HelpCircle,
} from "lucide-react";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { createProject, GeoJSONGeometry, ProjectStatus } from "@slices/projectSlice";
import { MapLayer } from "@slices/mapSlice";

type Step = "details" | "map";

export default function NewProjectPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<any | null>(null);

  const [step, setStep] = useState<Step>("details");

  // Step 1: project details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planning");
  const [utilityType, setUtilityType] = useState<MapLayer | "">("");

  // Step 2: geometry
  const [geometry, setGeometry] = useState<GeoJSONGeometry | null>(null);
  const [activeTool, setActiveTool] = useState<"line" | "area" | "none">("none");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Redirect if not logged in or citizen
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "citizen") {
      router.push("/dashboard/citizen");
      return;
    }
  }, [user, router]);

  // Init map only when we enter "map" step
// Init map only when we enter "map" step
useEffect(() => {
  if (step !== "map") return;
  if (typeof window === "undefined") return;
  if (mapRef.current || !mapContainerRef.current) return;

  const map = new maplibregl.Map({
    container: mapContainerRef.current,
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: [78.9629, 20.5937],
    zoom: 4,
    attributionControl: false,
    // @ts-expect-error validate exists at runtime but missing in typings
    validate: false,
  });

  mapRef.current = map;

  map.addControl(new maplibregl.NavigationControl(), "bottom-right");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const draw = new (MapboxDraw as any)({
    displayControlsDefault: false,
    controls: {},
  }) as any;

  drawRef.current = draw;
  map.addControl(draw as any, "top-left");

  // ✅ start in line drawing mode by default + update button state
  draw.changeMode("draw_line_string");
  setActiveTool("line");

  // ✅ if we already have geometry (coming back from details), add it ONCE
  if (geometry) {
    draw.add({
      id: "existing-geometry",
      type: "Feature",
      properties: {},
      geometry,
    });
  }

  const handleDrawChange = () => {
    if (!drawRef.current) return;
    const all = drawRef.current.getAll();
    if (!all.features.length) {
      setGeometry(null);
      return;
    }
    const feature = all.features[all.features.length - 1];
    // ⛔ only update React state, NO changeMode here
    setGeometry(feature.geometry as GeoJSONGeometry);
  };

  map.on("draw.create", handleDrawChange);
  map.on("draw.update", handleDrawChange);
  map.on("draw.delete", handleDrawChange);

  return () => {
    map.off("draw.create", handleDrawChange);
    map.off("draw.update", handleDrawChange);
    map.off("draw.delete", handleDrawChange);
    map.remove();
    mapRef.current = null;
    drawRef.current = null;
  };
  // 🔴 IMPORTANT: depend only on step (NOT geometry)
}, [step]);


  // --- Map toolbar handlers ---

  const startDrawLine = () => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("draw_line_string");
    setActiveTool("line"); // NEW
  };

  const startDrawPolygon = () => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("draw_polygon");
    setActiveTool("area"); // NEW
  };

  const finishDrawing = () => {
    if (!drawRef.current) return;
    drawRef.current.changeMode("simple_select");
    setActiveTool("none"); // NEW: nothing selected
  };


  const undoLastShape = () => {
    if (!drawRef.current) return;
    const all = drawRef.current.getAll();
    if (!all.features.length) return;
    const last = all.features[all.features.length - 1];
    if (last.id) {
      drawRef.current.delete(last.id as string);
    }
  };

  const clearAllShapes = () => {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();
    setGeometry(null);
  };

  // --- Step navigation ---

  const handleNextToMap = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!locationName.trim()) {
      setError("Location / area name is required.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select start and end dates.");
      return;
    }

    if (!utilityType) {
      setError("Please select at least one utility type.");
      return;
    }

    setStep("map");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!geometry) {
      setError("Please draw your infrastructure on the map.");
      return;
    }

    try {
      setSubmitting(true);

      await dispatch(
        createProject({
          name: name.trim(),
          description: description.trim(),
          geometry,
          startDate,
          endDate,
          status,
          utilityType: utilityType || undefined,
        })
      ).unwrap();

      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role === "citizen") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {step === "details" ? (
        // --- STEP 1: DETAILS ---
        <main className="flex-1 overflow-y-auto">
          {/* tiny top bar: only Home + step indicator */}
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <span className="text-[11px] text-slate-500">Step 1 of 2</span>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 p-1.5 shadow-sm hover:bg-slate-100"
              aria-label="Go home"
            >
              <Home className="h-4 w-4 text-slate-700" />
            </button>
          </div>

          <form
            onSubmit={handleNextToMap}
            className="mx-auto flex max-w-xl flex-col gap-4 px-4 pb-6"
          >
            <h1 className="text-base font-semibold text-slate-800 mb-1">
              New Project
            </h1>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Fiber trench near Sector 7"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location / Area Name
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Sector 7, Main Road, Pune"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                placeholder="What work will happen, disruptions, depth, utility type, etc."
              />
            </div>

            {/* Utility Type selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Utility type
              </label>
              <div className="flex flex-wrap gap-2">
                {(["Sewage","Fiber Optic","LPG Line","Water Pipeline","Electric Line"] as MapLayer[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setUtilityType(t)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                      utilityType === t ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                    aria-pressed={utilityType === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Status selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project status
              </label>
              <div className="flex flex-wrap gap-2">
                {(["planning","active","completed","pending"] as ProjectStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                      status === s ? "bg-green-600 border-green-600 text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                    aria-pressed={status === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Budget (₹)
              </label>
              <input
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="500000"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                {error}
              </p>
            )}

            <div className="mt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Next: Draw on Map
              </button>
            </div>
          </form>
        </main>
      ) : (
        // --- STEP 2: MAP ---
        <main className="flex-1">
          <div className="relative h-screen w-full">
            {/* Map */}
            <div ref={mapContainerRef} className="h-full w-full" />

            {/* Step indicator */}
            <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] text-slate-600 shadow">
              Step 2 of 2
            </div>

            {/* Back to details */}
            <button
              onClick={() => setStep("details")}
              className="absolute left-2 top-2 z-20 inline-flex items-center justify-center rounded-full bg-white/95 p-2 shadow border border-slate-200 hover:bg-slate-100"
              aria-label="Back to details"
            >
              <ArrowLeft className="h-4 w-4 text-slate-800" />
            </button>

            {/* Go home */}
            <button
              onClick={() => router.push("/")}
              className="absolute right-2 top-2 z-20 inline-flex items-center justify-center rounded-full bg-white/95 p-2 shadow border border-slate-200 hover:bg-slate-100"
              aria-label="Go home"
            >
              <Home className="h-4 w-4 text-slate-800" />
            </button>

            {/* Help button */}
            <button
              onClick={() => setShowHelp((v) => !v)}
              className="absolute right-2 bottom-20 z-20 inline-flex items-center justify-center rounded-full bg-white/95 p-2 shadow border border-slate-200 hover:bg-slate-100"
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4 text-slate-800" />
            </button>

            {/* Help overlay */}
            {showHelp && (
              <div className="absolute left-2 right-2 bottom-28 z-20 rounded-xl bg-white/95 p-3 text-[11px] text-slate-700 shadow">
                <p className="font-semibold mb-1">How to draw</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tap <b>Line</b> or <b>Area</b> on the left.</li>
                  <li>Tap on the map to add points.</li>
                  <li>Tap <b>Done</b> when you finish drawing.</li>
                  <li><b>Last</b> removes last shape, <b>Clear</b> removes all.</li>
                </ul>
              </div>
            )}

            {/* Left tools: labeled icons */}
            <div className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex flex-col gap-2">
            {/* Line button */}
            <button
                type="button"
                onClick={startDrawLine}
                className={`inline-flex h-12 w-12 flex-col items-center justify-center rounded-lg border shadow ${
                activeTool === "line"
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white/95 border-slate-200 hover:bg-slate-100"
                }`}
                aria-label="Start line drawing"
            >
                <Minus
                className={`h-4 w-4 ${
                    activeTool === "line" ? "text-white" : "text-slate-800"
                }`}
                />
                <span
                className={`mt-0.5 text-[9px] leading-none ${
                    activeTool === "line" ? "text-white" : "text-slate-700"
                }`}
                >
                Line
                </span>
            </button>

            {/* Area button */}
            <button
                type="button"
                onClick={startDrawPolygon}
                className={`inline-flex h-12 w-12 flex-col items-center justify-center rounded-lg border shadow ${
                activeTool === "area"
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white/95 border-slate-200 hover:bg-slate-100"
                }`}
                aria-label="Start area drawing"
            >
                <Square
                className={`h-4 w-4 ${
                    activeTool === "area" ? "text-white" : "text-slate-800"
                }`}
                />
                <span
                className={`mt-0.5 text-[9px] leading-none ${
                    activeTool === "area" ? "text-white" : "text-slate-700"
                }`}
                >
                Area
                </span>
            </button>

            {/* Done button (not a “tool”, so never blue) */}
            <button
                type="button"
                onClick={finishDrawing}
                className="inline-flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-white/95 shadow border border-slate-200 hover:bg-slate-100"
                aria-label="Finish drawing"
            >
                <Check className="h-4 w-4 text-emerald-700" />
                <span className="mt-0.5 text-[9px] leading-none text-emerald-700">
                Done
                </span>
            </button>

            {/* Last + Clear stay neutral */}
            <button
                type="button"
                onClick={undoLastShape}
                className="inline-flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-white/95 shadow border border-slate-200 hover:bg-slate-100"
                aria-label="Remove last shape"
            >
                <RotateCcw className="h-4 w-4 text-slate-800" />
                <span className="mt-0.5 text-[9px] leading-none text-slate-700">
                Last
                </span>
            </button>
            <button
                type="button"
                onClick={clearAllShapes}
                className="inline-flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-white/95 shadow border border-slate-200 hover:bg-slate-100"
                aria-label="Clear all shapes"
            >
                <Trash2 className="h-4 w-4 text-red-600" />
                <span className="mt-0.5 text-[9px] leading-none text-red-600">
                Clear
                </span>
            </button>
            </div>
  

            {/* Bottom-center: status + save */}
            <div className="absolute inset-x-0 bottom-3 z-20 flex flex-col items-center gap-2 px-4">
              {!geometry && (
                <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] text-slate-600 shadow">
                  Tap <b>Line</b> or <b>Area</b>, then tap on the map to start.
                </span>
              )}
              {geometry && (
                <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] text-slate-700 shadow">
                  Geometry: <b>{geometry.type}</b>
                </span>
              )}

              <form onSubmit={handleSubmit} className="w-full max-w-xs">
                {error && (
                  <p className="mb-2 text-[11px] text-red-600 bg-red-50 rounded px-2 py-1">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Project"}
                </button>
              </form>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
