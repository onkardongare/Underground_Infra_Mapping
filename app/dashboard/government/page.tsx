// app/dashboard/government/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@hooks/useAppSelector";
import { useAppDispatch } from "@hooks/useAppDispatch";
import {
  fetchProjects,
  selectProjects,
  approveProject,
  deleteProject,
} from "@slices/projectSlice";

export default function GovernmentDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const projects = useAppSelector(selectProjects);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "government_officer") {
      if (user.role === "citizen") router.push("/dashboard/citizen");
      else router.push("/dashboard/contractor");
      return;
    }

    dispatch(fetchProjects());
  }, [user, router, dispatch]);

  if (!user) return null;

  const pending = projects.filter((p) => !p.approved);
  const approved = projects.filter((p) => p.approved);

  const totalProjects = projects.length;
  const pendingCount = pending.length;
  const approvedCount = approved.length;
  const approvalRate =
    totalProjects > 0 ? Math.round((approvedCount / totalProjects) * 100) : 0;

  const deletingProject = deleting
    ? projects.find((p) => p.id === deleting)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Top bar */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Government Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome, <span className="font-medium">{user.name}</span>. Review
              and approve infrastructure projects, and keep track of what is
              happening underground in your city.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              🏠 Home
            </button>
            <button
              onClick={() => router.push("/projects/new")}
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              ➕ Create Project
            </button>
          </div>
        </header>

        {/* Metrics */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Overview
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Total Projects
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalProjects}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                All projects created by contractors.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-xs font-medium text-amber-700">
                Pending Approvals
              </p>
              <p className="mt-2 text-2xl font-semibold text-amber-900">
                {pendingCount}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Need your review and decision.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-medium text-emerald-700">
                Approved Projects
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">
                {approvedCount}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Already cleared for execution.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Approval Rate
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {approvalRate}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Percentage of projects that are approved.
              </p>
            </div>
          </div>
        </section>

        {/* Lists */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Pending approvals */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Pending Approvals
            </h2>
            <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-sm">
              {pending.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No pending projects at the moment. You&apos;re all caught up.
                </p>
              ) : (
                <div className="space-y-2">
                  {pending.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-amber-100 bg-amber-50/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {p.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-600">
                            {p.description || "No description provided."}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row">
                          <button
                            onClick={() => dispatch(approveProject(p.id))}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setDeleting(p.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Approved list */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Approved Projects
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              {approved.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No approved projects yet. Once you approve them, they will
                  appear here.
                </p>
              ) : (
                <div className="space-y-2">
                  {approved.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {p.name}
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                              Active
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {p.description || "No description provided."}
                          </p>
                        </div>
                        <button
                          onClick={() => setDeleting(p.id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation modal */}
      {deleting && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/30"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              Confirm Delete
            </h3>
            <p className="mt-2 text-xs text-slate-600">
              Are you sure you want to delete "
              {deletingProject?.name || "this project"}"? This action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await dispatch(deleteProject(deleting)).unwrap();
                    setFeedback({ type: "success", text: "Project deleted" });
                  } catch (err: any) {
                    console.log("Error deleting project:", err);
                    setFeedback({
                      type: "error",
                      text: err?.message ?? "Failed to delete project",
                    });
                  } finally {
                    setDeleting(null);
                    setTimeout(() => setFeedback(null), 3000);
                  }
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Small feedback toast */}
      {feedback && (
        <div
          className={`fixed bottom-4 right-4 rounded-md px-3 py-2 text-sm shadow-lg ${
            feedback.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
}
