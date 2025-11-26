"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@hooks/useAppSelector";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);

  // Hide when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  function handleProfileRoute() {
    if (user?.role === "government_officer") router.push("/dashboard/government");
    else if (user?.role === "contractor") router.push("/dashboard/contractor");
    else router.push("/dashboard/citizen");
  }

  if (!isOpen) return null;

  const initials =
    user?.name
      ?.trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const formattedRole =
    user?.role === "government_officer"
      ? "Government Officer"
      : user?.role === "contractor"
      ? "Contractor"
      : user
      ? "Citizen"
      : "";

  return (
    <div
      ref={cardRef}
      className="
        absolute right-3 top-14 z-40
        w-72 rounded-xl border border-slate-200 bg-white/95 backdrop-blur
        p-4 shadow-lg
        transform origin-top-right transition-all duration-150
        animate-in fade-in zoom-in
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
            {initials}
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-900">
              Underground Infra
            </h2>
            {user && (
              <span className="mt-0.5 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                {formattedRole}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="
            p-1.5 rounded-full hover:bg-slate-100 active:bg-slate-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
          "
          aria-label="Close profile menu"
        >
          <X className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
        {user ? (
          <>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>

            <button
              className="
                mt-3 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white
                hover:bg-blue-700 active:bg-blue-800
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
              "
              onClick={handleProfileRoute}
            >
              View dashboard
            </button>

            <button
              className="
                w-full rounded-lg py-2 text-sm font-medium text-red-600
                hover:bg-red-50
                focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1
              "
              onClick={() => router.push("/auth/logout")}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Sign in to manage your dashboard, projects & preferences.
            </p>

            <button
              className="
                mt-3 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white
                hover:bg-blue-700 active:bg-blue-800
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
              "
              onClick={() => router.push("/auth/login")}
            >
              Login
            </button>

            <button
              className="
                w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700
                hover:bg-slate-50
                focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1
              "
              onClick={() => router.push("/auth/signup")}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </div>
  );
}
