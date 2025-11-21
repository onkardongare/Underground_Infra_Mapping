// app/auth/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { useAppSelector } from "@hooks/useAppSelector";
import { logoutUser } from "@slices/authSlice";

export default function LogoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg border border-slate-200 text-center space-y-3">
        <h1 className="text-xl font-semibold text-slate-800">Logging out</h1>
        <p className="text-sm text-slate-600">
          {status === "loading"
            ? "Clearing your session..."
            : "You have been logged out."}
        </p>

        <button
          onClick={() => router.push("/login")}
          className="mt-2 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
