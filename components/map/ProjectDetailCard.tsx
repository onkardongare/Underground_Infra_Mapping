// components/ProjectDetailCard.tsx
"use client";

import { CheckCircle2, Clock3, MapPin } from "lucide-react";
import type { Project } from "@/store/slices/projectSlice";

interface ProjectDetailCardProps {
  project: Project;
}

export default function ProjectDetailCard({ project }: ProjectDetailCardProps) {
  const {
    name,
    status,
    utilityType,
    description,
    startDate,
    endDate,
    approved,
    approvedAt,
  } = project;

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="max-w-xs rounded-2xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900 line-clamp-2">
              {name}
            </h2>
            {approved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Approved
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
              <MapPin className="h-3 w-3" />
              {utilityType || "Unknown utility"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
              <Clock3 className="h-3 w-3" />
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="mt-2 text-[11px] text-slate-700 line-clamp-3">
          {description}
        </p>
      )}

      {/* Dates */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
        {startDate && (
          <div>
            <div className="font-medium text-slate-500">Start</div>
            <div>{new Date(startDate).toLocaleDateString()}</div>
          </div>
        )}
        {endDate && (
          <div>
            <div className="font-medium text-slate-500">End</div>
            <div>{new Date(endDate).toLocaleDateString()}</div>
          </div>
        )}
        {approved && approvedAt && (
          <div className="col-span-2">
            <div className="font-medium text-slate-500">Approved at</div>
            <div>{new Date(approvedAt).toLocaleString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
