"use client";

import { Menu, Search, User } from "lucide-react";
import { useState } from "react";
import ProfileMenu from "../components/ProfileMenu";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <div className="relative w-full px-2 py-2 z-20 flex items-center justify-between">
      
      {/* Profile Icon (HIDE when openProfile = true) */}
      {!openProfile && (
        <button
          onClick={() => setOpenProfile(true)}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            bg-white shadow-md border border-slate-200
            p-2 rounded-full
            hover:bg-slate-50 active:bg-slate-100
            z-30
          "
        >
          <User className="w-6 h-6 text-slate-700" />
        </button>
      )}

      {/* Search Box */}
      <div
        className="
          flex items-center
          w-full max-w-xs sm:max-w-sm md:max-w-md
          rounded-xl border border-slate-200 bg-white
          px-3 py-1.5 shadow-sm
        "
      >
        <button
          onClick={onMenuClick}
          className="rounded-full p-2 hover:bg-slate-100 active:bg-slate-200"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </button>

        <input
          type="text"
          placeholder="Search location..."
          className="
            ml-2 flex-1 bg-transparent border-none outline-none
            text-sm text-slate-800 placeholder:text-slate-400
          "
        />

        <button className="rounded-full p-2 hover:bg-slate-100 active:bg-slate-200">
          <Search className="h-5 w-5 text-slate-700" />
        </button>
      </div>

      {/* Profile Menu Component */}
      <ProfileMenu
        isOpen={openProfile}
        onClose={() => setOpenProfile(false)}
      />
    </div>
  );
}
