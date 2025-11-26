// app/dashboard/contractor/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@hooks/useAppSelector";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { fetchProjects, selectProjects, deleteProject } from "@slices/projectSlice";

export default function ContractorDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const projects = useAppSelector(selectProjects);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role === "citizen") {
      router.push("/dashboard/citizen");
      return;
    }

    if (user.role === "government_officer") {
      router.push("/dashboard/government");
      return;
    }

    dispatch(fetchProjects());
  }, [user, router, dispatch]);

  if (!user) return null;

  const myProjects = projects.filter((p) => p.ownerId === user.id);

  const totalProjects = myProjects.length;
  const approvedProjects = myProjects.filter((p) => p.approved).length;
  const pendingProjects = myProjects.filter((p) => !p.approved).length;

  const deletingProject = deleting ? projects.find((p) => p.id === deleting) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Top bar */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Contractor Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome, <span className="font-medium">{user.name}</span>. Create and manage underground
              infrastructure projects and track their approval status.
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Total Projects</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{totalProjects}</p>
              <p className="mt-1 text-xs text-slate-500">
                All projects created by your account.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-medium text-emerald-700">Approved</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">{approvedProjects}</p>
              <p className="mt-1 text-xs text-emerald-700">
                Projects cleared by the government.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-xs font-medium text-amber-700">Pending Approval</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900">{pendingProjects}</p>
              <p className="mt-1 text-xs text-amber-700">
                Waiting for government review.
              </p>
            </div>
          </div>
        </section>

        {/* Projects list */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Your Projects</h2>
            {myProjects.length > 0 && (
              <button
                onClick={() => router.push("/projects/new")}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                + New project
              </button>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            {myProjects.length === 0 ? (
              <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">
                  No projects yet.
                </p>
                <p className="text-xs text-slate-500">
                  Start by creating your first underground infrastructure project.
                </p>
                <button
                  onClick={() => router.push("/projects/new")}
                  className="mt-2 inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  ➕ Create your first project
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {myProjects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {p.name}
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {p.status}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              p.approved
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {p.approved ? "Approved" : "Pending"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {p.description || "No description"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-start">
                        {/* Future: add an Edit button here */}
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
        </section>
      </div>

      {/* Confirmation modal */}
      {deleting && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/30"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Confirm Delete</h3>
            <p className="mt-2 text-xs text-slate-600">
              Are you sure you want to delete "{deletingProject?.name || "this project"}"? This
              action cannot be undone.
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
                    await dispatch(deleteProject(deleting as string)).unwrap();
                    setFeedback({ type: "success", text: "Project deleted" });
                  } catch (err: any) {
                    setFeedback({
                      type: "error",
                      text: err?.message ?? "Failed to delete",
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
          className={`fixed right-4 bottom-4 rounded-md px-3 py-2 text-sm shadow-lg ${
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
