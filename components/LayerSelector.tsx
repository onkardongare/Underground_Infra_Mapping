"use client";

import { useState } from "react";
import { Layers, Cable, Flame, Droplets, Zap, Trash2, X, Check } from "lucide-react";

type Layer = {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
};

const LAYERS: Layer[] = [
  { name: "Sewage",        icon: Trash2,  color: "text-green-600" },
  { name: "Fiber Optic",   icon: Cable,   color: "text-purple-600" },
  { name: "LPG Line",      icon: Flame,   color: "text-orange-600" },
  { name: "Water Pipeline",icon: Droplets,color: "text-blue-600" },
  { name: "Electric Line", icon: Zap,     color: "text-yellow-500" },
];

interface LayerSelectorProps {
  onChange?: (selectedLayers: string[]) => void;
}

export default function LayerSelector({ onChange }: LayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleLayer = (name: string) => {
    setSelected((prev) => {
      const exists = prev.includes(name);
      const next = exists ? prev.filter((l) => l !== name) : [...prev, name];
      onChange?.(next);
      return next;
    });
  };

  const clearAll = () => {
    setSelected([]);
    onChange?.([]);
  };

  return (
    <div className="absolute right-3 bottom-28 z-40">
      {/* When open: show panel ONLY (hide main button) */}
      {isOpen ? (
        <div className="w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2">
          {/* Header with close button */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Layers
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-full p-1 hover:bg-slate-100 active:bg-slate-200"
              aria-label="Close layer selector"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {/* Scrollable list */}
          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {LAYERS.map((layer) => {
              const Icon = layer.icon;
              const isActive = selected.includes(layer.name);
              return (
                <button
                  key={layer.name}
                  onClick={() => toggleLayer(layer.name)}
                  className={`
                    flex w-full items-center justify-between
                    rounded-lg border px-2 py-1.5 text-left text-sm
                    transition
                    ${isActive ? "border-blue-500 bg-slate-100" : "border-slate-200 bg-white hover:bg-slate-50"}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${layer.color}`} />
                    <span className="text-slate-800">{layer.name}</span>
                  </span>

                  {/* Custom checkbox */}
                  <span
                    className={`
                      flex h-4 w-4 items-center justify-center rounded-sm border text-[10px]
                      ${isActive ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 bg-white"}
                    `}
                  >
                    {isActive && <Check className="h-3 w-3" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer: clear button */}
          <div className="mt-2 flex justify-end">
            <button
              onClick={clearAll}
              className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
            >
              Clear selection
            </button>
          </div>
        </div>
      ) : (
        // When closed: show main floating button
        <button
          onClick={() => setIsOpen(true)}
          className="
            rounded-full border border-slate-300 bg-white
            p-3 shadow-xl
            hover:bg-slate-100 active:bg-slate-200
          "
          aria-label="Open layer selector"
        >
          <Layers className="h-6 w-6 text-slate-700" />
        </button>
      )}
    </div>
  );
}
