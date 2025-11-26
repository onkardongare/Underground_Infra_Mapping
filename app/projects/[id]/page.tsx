// app/projects/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAppDispatch } from "@hooks/useAppDispatch";
import { useAppSelector } from "@hooks/useAppSelector";
import {
  fetchProjects,
  selectProjects,
  type Project,
} from "@/store/slices/projectSlice";

import ProjectDetailCard from "@components/map/ProjectDetailCard";
import ProjectMiniMap from "@components/map/ProjectMiniMap";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const projects = useAppSelector(selectProjects);
  const status = useAppSelector((state) => state.projects.status);

  // Load projects if not already loaded
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProjects());
    }
  }, [status, dispatch]);

  const project: Project | undefined = projects.find((p) => p.id === id);

  const handleBack = () => {
    router.back();
  };

  if (status === "loading" && !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl bg-white px-4 py-2 text-sm text-slate-600 shadow">
          Loading project details...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <div className="mb-3 text-sm text-slate-600">
          We couldn’t find this project. It may have been removed or is still loading.
        </div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    );
  }

  const statusLabel =
    project.status.charAt(0).toUpperCase() + project.status.slice(1);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3">
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-1.5 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </button>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Project Detail
          </div>
          <div className="text-sm font-semibold text-slate-900">
            {project.name}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 justify-center px-4 py-6">
        <div className="flex w-full max-w-5xl flex-col gap-4 lg:flex-row">
          {/* Left column: friendly info */}
          <section className="flex-1 space-y-4">
            {/* Simple overview card */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Overview
              </h2>

              <div className="mt-2">
                <div className="text-base font-semibold text-slate-900">
                  {project.name}
                </div>
                {project.description && (
                  <p className="mt-1 text-sm text-slate-700">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                {project.utilityType && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                    {project.utilityType}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  Status: {statusLabel}
                </span>
                {project.approved && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                    Approved
                  </span>
                )}
              </div>
            </div>

            {/* Timeline / dates */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Timeline
              </h2>

              <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Planned start
                  </div>
                  <div>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "Not set"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Planned end
                  </div>
                  <div>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "Not set"}
                  </div>
                </div>

                {project.approved && project.approvedAt && (
                  <div className="sm:col-span-2">
                    <div className="text-xs font-medium text-slate-500">
                      Approved on
                    </div>
                    <div>
                      {new Date(project.approvedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Extra simple meta block (optional, hide tech words) */}
            <div className="rounded-2xl bg-white p-4 shadow-sm text-sm text-slate-700">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                More info
              </h2>
              <div className="mt-2 space-y-1">
                <div>
                  <span className="text-xs font-medium text-slate-500">
                    Project ID:
                  </span>{" "}
                  <span className="break-all text-xs text-slate-700">
                    {project.id}
                  </span>
                </div>
                {project.ownerId && (
                  <div>
                    <span className="text-xs font-medium text-slate-500">
                      Created by:
                    </span>{" "}
                    <span className="text-xs text-slate-700">
                      {project.ownerId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right column: map card */}
          <section className="w-full space-y-3 lg:w-80">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location on map
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                This small map shows where this project is placed on the city or
                area map.
              </p>

              <div className="mt-3">
                <ProjectMiniMap project={project} />
              </div>
            </div>

            {/* Reuse the compact detail card if you like */}
            <div className="hidden rounded-2xl bg-white p-3 shadow-sm lg:block">
              <ProjectDetailCard project={project} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
