// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "@components/Navbar";
import Sidebar from "@components/Sidebar";
import LayerSelector from "@components/LayerSelector";
import ProjectMap from "@components/map/ProjectMap";
import { useAppSelector } from "@hooks/useAppSelector";

export default function Home() {
  const user = useAppSelector((state) => state.auth.user);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");

    const handleChange = (e: MediaQueryList | MediaQueryListEvent) => {
      const matches = "matches" in e ? e.matches : mq.matches;
      setIsDesktop(matches);
    };

    handleChange(mq);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const handleMenuClick = () => setSidebarOpen((prev) => !prev);
  const handleSidebarClose = () => setSidebarOpen(false);

  const headerHidden = isSidebarOpen && !isDesktop;

  return (
    <div className="relative flex h-screen w-full flex-col bg-slate-50 font-sans">
      <header
        className={`absolute left-0 right-0 top-0 z-30 px-2 pt-2 transition-opacity duration-300 ${
          headerHidden ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Navbar onMenuClick={handleMenuClick} />
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          isDesktop={isDesktop}
          onMenuClick={handleSidebarClose}
        />

        <main className="relative flex-1 bg-slate-100">
          <LayerSelector />
          <ProjectMap />
        </main>
      </div>

      {user && user.role === "citizen" && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-xs text-slate-700 shadow">
          You are in citizen mode – map is read-only.
        </div>
      )}
    </div>
  );
}
