"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RaterRow = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  sessionStartedAt: string | null;
  sessionCompletedAt: string | null;
  avgTaskMs: number | null;
  _count?: { ratings: number };
};

function formatMs(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function sessionDuration(r: RaterRow): string {
  if (!r.sessionStartedAt) return "—";
  const start = new Date(r.sessionStartedAt).getTime();
  const end = r.sessionCompletedAt ? new Date(r.sessionCompletedAt).getTime() : null;
  if (!end) return "In progress";
  return formatMs(end - start);
}

export default function AdminPage() {
  const [raters, setRaters] = useState<RaterRow[]>([]);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/raters").then((r) => r.json()),
      fetch("/api/images").then((r) => r.json()),
    ]).then(([ratersData, imagesData]) => {
      setRaters(ratersData);
      setTotalImages(imagesData.length);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Admin — Dark Pattern Rating</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to study
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Export buttons */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Export data
          </h2>
          <div className="flex gap-3">
            <a
              href="/api/export/excel"
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              Download Excel
            </a>
            <a
              href="/api/export/csv"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Download CSV
            </a>
            <a
              href="/api/export/json"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Download JSON
            </a>
          </div>
        </section>

        {/* Raters table */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Raters &amp; progress
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : raters.length === 0 ? (
            <p className="text-sm text-gray-400">No raters yet.</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Avg Task</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Session</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {raters.map((r) => {
                    const count = r._count?.ratings ?? 0;
                    const pct = totalImages > 0 ? Math.round((count / totalImages) * 100) : 0;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                        <td className="px-4 py-3 text-gray-500">{r.email}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                          {r.avgTaskMs != null ? formatMs(r.avgTaskMs) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                          {sessionDuration(r)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-gray-500 tabular-nums w-14 text-right">
                              {count} / {totalImages}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
