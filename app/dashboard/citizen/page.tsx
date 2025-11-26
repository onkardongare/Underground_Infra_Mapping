// app/dashboard/citizen/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@hooks/useAppSelector";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { fetchProjects, selectProjects } from "@slices/projectSlice";

export default function CitizenDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const projects = useAppSelector(selectProjects);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "citizen") {
      // redirect other roles to their dashboards
      if (user.role === "contractor") router.push("/dashboard/contractor");
      else router.push("/dashboard/government");
      return;
    }

    dispatch(fetchProjects());
  }, [user, router, dispatch]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">
        Citizen Dashboard – {user.name}
      </h1>

      <p className="text-sm text-slate-600">
        You can view approved underground projects on the map and in the list
        below.
      </p>

      <button
        onClick={() => router.push("/")}
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Open Map
      </button>

      <div className="mt-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Approved Projects
        </h2>

        <div className="space-y-2">
          {projects.length === 0 && (
            <p className="text-xs text-slate-500">No projects to show.</p>
          )}

          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-lg bg-white border border-slate-200 p-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-800">
                  {p.name}
                </h3>
                <span className="text-[11px] rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">
                  {p.approved ? "Approved" : "Pending"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {p.description || "No description"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
