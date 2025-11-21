"use client";

import React, { useEffect, useRef } from "react";
import { Layers, AlertTriangle, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isDesktop: boolean;
  onMenuClick: () => void;
}

export default function Sidebar({ isOpen, isDesktop, onMenuClick }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onMenuClick();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onMenuClick]);

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed inset-y-0 left-0 z-30
        flex-shrink-0
        w-64 sm:w-72 lg:w-80 xl:w-96
        bg-white border-r border-slate-200
        shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex h-full flex-col p-4 gap-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2">
          <h3 className="text-lg font-bold text-blue-800">Underground Infra</h3>

          <button
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-blue-100 active:bg-blue-200"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Layers */}
        <nav className="space-y-1">
          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Layers
          </p>

          <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
            <Layers className="h-4 w-4 text-orange-500" />
            Underground Utilities
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Active Digging Sites
          </button>
        </nav>
      </div>
    </aside>
  );
}
