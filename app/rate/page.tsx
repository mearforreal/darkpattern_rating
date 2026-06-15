"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type RaterSession = {
  raterId: number;
  name: string;
  email: string;
  currentImageIndex: number;
};

type ImageRecord = {
  id: number;
  filename: string;
  order: number;
};

type RatingValues = {
  isDarkPattern: "yes" | "no" | null;
  confidence: number | null;
  comment: string;
};

const EMPTY_RATING: RatingValues = { isDarkPattern: null, confidence: null, comment: "" };

export default function RatePage() {
  const router = useRouter();
  const [session, setSession] = useState<RaterSession | null>(null);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Map<number, RatingValues>>(new Map());
  const [current, setCurrent] = useState<RatingValues>(EMPTY_RATING);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nextImageRef = useRef<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("raterSession");
    if (!stored) {
      router.replace("/");
      return;
    }
    try {
      const s: RaterSession = JSON.parse(stored);
      if (!s.raterId) throw new Error("No raterId");
      setSession(s);

      Promise.all([
        fetch("/api/images").then((r) => r.json()),
        fetch(`/api/ratings?raterId=${s.raterId}`).then((r) => r.json()),
      ]).then(([imgs, existingRatings]) => {
        setImages(imgs);
        const map = new Map<number, RatingValues>();
        for (const r of existingRatings) {
          map.set(r.imageId, {
            isDarkPattern: r.isDarkPattern,
            confidence: r.confidence,
            comment: r.comment ?? "",
          });
        }
        setRatings(map);

        // If all images have been rated, go to done regardless of stored index.
        if (imgs.length > 0 && existingRatings.length >= imgs.length) {
          const name = encodeURIComponent(s.name ?? "");
          localStorage.removeItem("raterSession");
          router.replace(`/done?name=${name}`);
          return;
        }

        // Cap stored index against actual ratings count so stale localStorage
        // can't skip past images cleared from the database.
        const storedIdx = s.currentImageIndex ?? 0;
        const idx = Math.min(storedIdx, existingRatings.length);

        if (idx >= imgs.length) {
          const name = encodeURIComponent(s.name ?? "");
          localStorage.removeItem("raterSession");
          router.replace(`/done?name=${name}`);
          return;
        }

        setCurrentIndex(idx);
        if (idx !== storedIdx) {
          localStorage.setItem("raterSession", JSON.stringify({ ...s, currentImageIndex: idx }));
        }

        const img = imgs[idx];
        if (img) {
          setCurrent(map.get(img.id) ?? EMPTY_RATING);
        }
      });
    } catch {
      localStorage.removeItem("raterSession");
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (images.length === 0) return;
    const img = images[currentIndex];
    if (img) {
      setCurrent(ratings.get(img.id) ?? EMPTY_RATING);
    }
  }, [currentIndex, images, ratings]);

  useEffect(() => {
    if (images.length === 0) return;
    const next = images[currentIndex + 1];
    if (next) {
      nextImageRef.current = `/images/${next.filename}`;
      const img = new window.Image();
      img.src = `/images/${next.filename}`;
    }
  }, [currentIndex, images]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case "y":
        case "Y":
          setCurrent((c) => ({ ...c, isDarkPattern: "yes" }));
          break;
        case "n":
        case "N":
          setCurrent((c) => ({ ...c, isDarkPattern: "no" }));
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          setCurrent((c) => ({ ...c, confidence: Number(e.key) }));
          break;
        case "Enter":
          if (canAdvance) handleNext();
          break;
        case "ArrowLeft":
          if (currentIndex > 0) handlePrev();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const canAdvance = current.isDarkPattern !== null && current.confidence !== null;

  const saveRating = useCallback(
    async (index: number, values: RatingValues, session: RaterSession, images: ImageRecord[]) => {
      const img = images[index];
      if (!img || !values.isDarkPattern || !values.confidence) return;

      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterId: session.raterId,
          imageId: img.id,
          isDarkPattern: values.isDarkPattern,
          confidence: values.confidence,
          comment: values.comment || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save rating");
      }
    },
    []
  );

  async function handleNext() {
    if (!session || !canAdvance) return;
    setSaving(true);
    setError("");

    try {
      await saveRating(currentIndex, current, session, images);

      const img = images[currentIndex];
      const newRatings = new Map(ratings);
      newRatings.set(img.id, current);
      setRatings(newRatings);

      const nextIndex = currentIndex + 1;
      const newSession = { ...session, currentImageIndex: nextIndex };
      localStorage.setItem("raterSession", JSON.stringify(newSession));
      setSession(newSession);

      if (nextIndex >= images.length) {
        const name = encodeURIComponent(session.name ?? "");
        localStorage.removeItem("raterSession");
        router.push(`/done?name=${name}`);
      } else {
        setCurrentIndex(nextIndex);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handlePrev() {
    if (!session || currentIndex === 0) return;
    setSaving(true);
    setError("");

    try {
      if (canAdvance) {
        await saveRating(currentIndex, current, session, images);
        const img = images[currentIndex];
        const newRatings = new Map(ratings);
        newRatings.set(img.id, current);
        setRatings(newRatings);
      }

      const prevIndex = currentIndex - 1;
      const newSession = { ...session, currentImageIndex: prevIndex };
      localStorage.setItem("raterSession", JSON.stringify(newSession));
      setSession(newSession);
      setCurrentIndex(prevIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleSwitchRater() {
    localStorage.removeItem("raterSession");
    router.push("/");
  }

  const currentImage = images[currentIndex];

  if (!session || images.length === 0 || !currentImage) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height: "100dvh" }}>
        Loading…
      </div>
    );
  }

  const progress = (currentIndex / images.length) * 100;

  return (
    <div className="flex flex-col overflow-hidden bg-gray-50" style={{ height: "100dvh" }}>
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-900">Dark Pattern Rating</div>
          <button
            onClick={handleSwitchRater}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Switch rater
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{session.name}</span>
          <span className="text-gray-300">·</span>
          <span>
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400">Y/N · 1–5 · Enter · ←</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 shrink-0 bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 min-h-0 min-w-0">
        {/* Left: image — relative+fill avoids Safari h-full-in-flex bugs */}
        <div className="relative flex-1 min-w-0 bg-gray-100 border-r border-gray-200 overflow-hidden">
          <div className="absolute inset-6">
            <div className="relative w-full h-full">
              <Image
                key={currentImage.id}
                fill
                src={`/images/${currentImage.filename}`}
                alt={`Screenshot ${currentIndex + 1}`}
                className="object-contain rounded-lg shadow-md"
                sizes="60vw"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right: survey */}
        <div className="flex w-80 shrink-0 flex-col justify-between p-6 bg-white overflow-hidden">
          <div className="flex flex-col gap-6">
            {/* Dark pattern judgment */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Is this a dark pattern?
              </p>
              <div className="flex gap-3">
                {(["yes", "no"] as const).map((val) => (
                  <label
                    key={val}
                    className={`flex-1 cursor-pointer rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition select-none ${
                      current.isDarkPattern === val
                        ? val === "yes"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="isDarkPattern"
                      value={val}
                      checked={current.isDarkPattern === val}
                      onChange={() => setCurrent((c) => ({ ...c, isDarkPattern: val }))}
                      className="sr-only"
                    />
                    {val === "yes" ? "Yes" : "No"}
                  </label>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Confidence level
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 shrink-0">Low</span>
                <div className="flex flex-1 gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label
                      key={n}
                      className={`w-10 h-10 cursor-pointer rounded-full border-2 flex items-center justify-center text-sm font-medium transition select-none ${
                        current.confidence === n
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="confidence"
                        value={n}
                        checked={current.confidence === n}
                        onChange={() => setCurrent((c) => ({ ...c, confidence: n }))}
                        className="sr-only"
                      />
                      {n}
                    </label>
                  ))}
                </div>
                <span className="text-xs text-gray-400 shrink-0">High</span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="comment">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="comment"
                rows={3}
                value={current.comment}
                onChange={(e) => setCurrent((c) => ({ ...c, comment: e.target.value }))}
                placeholder="Describe what you observed…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || saving}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              disabled={!canAdvance || saving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "Saving…"
                : currentIndex === images.length - 1
                ? "Finish"
                : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
