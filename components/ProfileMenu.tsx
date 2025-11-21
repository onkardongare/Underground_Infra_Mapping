"use client";

import { use, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  userName?: string;
  email?: string;
}

export default function ProfileMenu({
  isOpen,
  onClose,
  isLoggedIn,
  userName = "Guest",
  email = "guest@example.com",
}: ProfileMenuProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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

  if (!isOpen) return null;

  return (
    <div
      ref={cardRef}
      className="
        absolute right-3 top-14 z-40
        w-64 rounded-xl border border-slate-200 bg-white
        p-4 shadow-xl space-y-2
      "
    >
      {/* Close Button */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-lg">Underground Infra</h2>
        <button
          onClick={onClose}
          className="
            p-1.5 rounded-full hover:bg-slate-100 active:bg-slate-200
          "
          aria-label="Close profile menu"
        >
          <X className="w-4 h-4 text-slate-700" />
        </button>
      </div>

      {isLoggedIn ? (
        <>
          <h3 className="text-lg font-semibold text-slate-800">
            Your Profile
          </h3>
          <p className="text-sm text-slate-600">Name: {userName}</p>
          <p className="text-sm text-slate-600">Email: {email}</p>

          <button
            className="
              mt-2 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white
              hover:bg-blue-700 active:bg-blue-800
            "
          >
            View Full Profile
          </button>

          <button
            className="
              w-full rounded-lg py-2 text-sm font-medium text-red-600
              hover:bg-red-50
            "
            onClick={()=> router.push('auth/logout')}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-slate-800">Welcome</h3>
          <p className="text-sm text-slate-600">
            Sign in to save your maps & preferences.
          </p>

          <button
            className="
              mt-2 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white
              hover:bg-blue-700 active:bg-blue-800
            "
            onClick={()=> router.push('/auth/login')}
          >
            Login
          </button>

          <button
            className="
              w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700
              hover:bg-slate-50
            "
            onClick={()=> router.push('/auth/signup')}
          >
            Sign up
          </button>
        </>
      )}
    </div>
  );
}
