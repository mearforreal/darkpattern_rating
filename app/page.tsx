"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IntroFlow from "@/app/components/IntroFlow";

type ConsentState = "pending" | "agreed" | "declined";

export default function IdentificationPage() {
  const router = useRouter();
  const [consent, setConsent] = useState<ConsentState>("pending");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("raterSession");
    if (!stored) return;
    try {
      const session = JSON.parse(stored);
      if (!session.raterId) return;
      fetch(`/api/raters?id=${session.raterId}`).then((res) => {
        if (res.ok) {
          router.replace("/rate");
        } else {
          localStorage.removeItem("raterSession");
        }
      });
    } catch {
      localStorage.removeItem("raterSession");
    }
  }, [router]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = name.trim().length > 0 && emailValid;

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setShowIntro(true);
  }

  async function beginRating() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const sessionStartedAt = new Date().toISOString();
      const res = await fetch("/api/raters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          sessionStartedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create rater");

      const ratingsRes = await fetch(`/api/ratings?raterId=${data.id}`);
      const existingRatings = ratingsRes.ok ? await ratingsRes.json() : [];

      localStorage.setItem(
        "raterSession",
        JSON.stringify({
          raterId: data.id,
          name: data.name,
          email: data.email,
          currentImageIndex: existingRatings.length,
          sessionStartedAt,
        })
      );
      router.push("/rate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (consent === "declined") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <p className="text-gray-600 text-sm">
            You have declined to participate. You may close this window.
          </p>
        </div>
      </main>
    );
  }

  if (consent === "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Consent to Participate
            </h1>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              You are invited to participate in a research study that involves rating whether an
              image is a dark pattern or not, and reporting your rating confidence level on a scale
              of 1 (Low) to 5 (High) for those evaluations.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Participation is voluntary and anonymous. You may withdraw at any time without penalty.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              By selecting <strong>&ldquo;Agree,&rdquo;</strong> you provide informed consent to
              participate; selecting <strong>&ldquo;Disagree&rdquo;</strong> will terminate
              participation.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConsent("agreed")}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Agree
              </button>
              <button
                onClick={() => setConsent("declined")}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Disagree
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Dark Pattern Rating Study
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your details to begin or resume your session.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white rounded-xl border border-gray-200 p-8 shadow-sm"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {email && !emailValid && (
                <p className="mt-1 text-xs text-red-500">Enter a valid email address.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Using the same email lets you resume where you left off.
          </p>
        </div>
      </main>

      {showIntro && (
        <IntroFlow
          onClose={() => setShowIntro(false)}
          onComplete={beginRating}
          loading={loading}
          error={error}
        />
      )}
    </>
  );
}
