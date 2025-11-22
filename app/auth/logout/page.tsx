"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useAppSelector } from "@hooks/useAppSelector";
import { logoutUser } from "@slices/authSlice";

export default function LogoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status } = useAppSelector((s) => s.auth);

  const [step, setStep] = useState<"confirm" | "done">("confirm");

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setStep("done");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg border border-slate-200 text-center space-y-4">

        {/* STEP 1 – Ask for confirmation */}
        {step === "confirm" && (
          <>
            <h1 className="text-xl font-semibold text-slate-800">
              Are you sure you want to log out?
            </h1>
            <p className="text-sm text-slate-600">
              You can always log back in anytime. We’ll miss you 👋
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.back()}
                className="w-1/2 rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="w-1/2 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </>
        )}

        {/* STEP 2 – Logged out screen */}
        {step === "done" && (
          <>
            <h1 className="text-xl font-semibold text-slate-800">
              You’ve been logged out 😊
            </h1>

            <p className="text-sm text-slate-600">
              What would you like to do next?
            </p>

            <div className="space-y-3 mt-4">
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Continue Without Login
              </button>

              <button
                onClick={() => router.push("/auth/login")}
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Login
              </button>

              <button
                onClick={() => router.push("/auth/signup")}
                className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Create an Account
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              “Your journey continues — with or without us.”
            </p>
          </>
        )}
      </div>
    </div>
  );
}
