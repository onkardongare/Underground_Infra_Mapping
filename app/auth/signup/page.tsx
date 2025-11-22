// app/auth/signup/page.tsx
"use client";

import { FormEvent, use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useAppSelector } from "@hooks/useAppSelector";
import {
  signupUser,
  clearAuthError,
  UserRole,
  LocationInfo,
} from "@slices/authSlice";
import { X } from "lucide-react";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "government_officer", label: "Government Officer" },
  { value: "contractor", label: "Contractor" },
];

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error, user } = useAppSelector((s) => s.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");

  const [locationDescription, setLocationDescription] = useState("");
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [locStatus, setLocStatus] = useState<"idle" | "requesting" | "failed">(
    "idle"
  );

  const handleLocationDetect = () => {
    if (!navigator.geolocation) {
      setLocStatus("failed");
      return;
    }
    setLocStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocStatus("idle");
      },
      () => {
        setLocStatus("failed");
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const location: LocationInfo = {
      lat: coords.lat,
      lng: coords.lng,
      description: locationDescription || undefined,
    };

    const result = await dispatch(
      signupUser({
        name,
        email,
        password,
        role,
        location,
      })
    );

    if (signupUser.fulfilled.match(result)) {
      router.push("/");
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
        <div className="flex  items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
            Sign up for Underground Infra
            </h1>
            <button className="bg-transparent hover:bg-slate-100" onClick={()=>router.push("/")}>
                <X className="h-7 w-7 text-slate-700" />
            </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Role Selection */}
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">
              Your Role
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`
                    flex cursor-pointer items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-medium
                    ${
                      role === opt.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  <input
                    type="radio"
                    className="hidden"
                    name="role"
                    value={opt.value}
                    checked={role === opt.value}
                    onChange={() => setRole(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Your Location
            </p>

            <button
              type="button"
              onClick={handleLocationDetect}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {locStatus === "requesting"
                ? "Detecting location..."
                : "Use my current location"}
            </button>

            {locStatus === "failed" && (
              <p className="text-xs text-red-600">
                Could not get your location. Please enter it manually.
              </p>
            )}

            {coords.lat && coords.lng && (
              <p className="text-xs text-emerald-700">
                Detected: lat {coords.lat.toFixed(4)}, lng {coords.lng.toFixed(4)}
              </p>
            )}

            <input
              type="text"
              placeholder="City / Area, State (optional but recommended)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <a href="/auth/login" className="font-medium text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
