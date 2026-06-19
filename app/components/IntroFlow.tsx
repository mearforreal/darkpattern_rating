"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ── Page dot indicator ────────────────────────────────────────────────────────

function PageDots({
  current,
  total,
  onSelect,
}: {
  current: number;
  total: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to page ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? "w-5 h-1.5 bg-orange-500"
              : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
          }`}
        />
      ))}
    </div>
  );
}

// ── Intro Page 1: Overview ────────────────────────────────────────────────────

function IntroPage1({ onNext, hideNext }: { onNext: () => void; hideNext?: boolean }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10 pb-28">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
          {/* Overview · 1 of 3 */}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
          Welcome to the Bad Default Detection Study
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Thank you for participating in this research study. The purpose of this study is to
          understand how human experts and artificial intelligence (AI) systems identify a specific
          type of dark pattern known as the{" "}
          <strong className="text-gray-700">Bad Default (Preselection)</strong> dark pattern in user
          interfaces. Before you begin, please review the instructions and examples below.
        </p>

        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-orange-400 shrink-0" />
            <h2 className="text-base font-semibold text-gray-900">What Is a Dark Pattern?</h2>
          </div>
          <div className="ml-3 bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
            For this study, we adopt the definition proposed by Gray, Colin M., et al (2024):{" "}
            <strong>
              Dark patterns are design choices that subvert, impair, or distort a user&apos;s ability
              to make autonomous and informed decisions when interacting with digital systems,
              regardless of the designer&apos;s intent.
            </strong>
          </div>
        </section>

        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-orange-400 shrink-0 " />

            <h2 className="text-base font-semibold text-gray-900">
              What Is a Bad Default (Preselection)?
            </h2>
          </div>
          <div className="ml-3 bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Bad Defaults occur when settings, options, or actions are{" "}
              <strong>preselected in a way that benefits the provider rather than the user</strong>,
              requiring users to actively change the default choice or setting that may cause harm,
              unintentional disclosure of information, or potentially undesirable outcomes. Bad
              Defaults subvert the user&apos;s expectation that default settings will be in their
              best interest.
            </p>
            <p className="text-gray-600">
              Bad Defaults are classified under{" "}
              <strong className="text-gray-700">Interface Interference</strong> — a design strategy
              that privileges certain actions over others by reducing the visibility or
              discoverability of alternative choices.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-orange-400 shrink-0" />
            <h2 className="text-base font-semibold text-gray-900">How to Identify a Bad Default</h2>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-500 mb-2">Typically, Bad Defaults often appear when:</p>
            <ul className="space-y-2 mb-4">
              {[
                "A checkbox is selected by default",
                "A radio button is preselected",
                "A privacy or data-sharing option is enabled by default",
                "A subscription or trial option is automatically selected",
                "A user must actively opt out of a provider-favored choice",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
              <strong>Note:</strong> The presence of a preselected option alone does not
              automatically constitute a dark pattern. Consider the overall context and whether the
              design appears to interfere with a user&apos;s ability to make an informed and
              autonomous choice. When making your decision, consider whether the preselected option
              could influence user behavior or steer users toward a choice they may not have
              intentionally made.
            </div>
          </div>
        </section>

        {!hideNext && (
          <div className="flex flex-col items-center gap-1.5 pt-2">
            <button
              onClick={onNext}
              className="rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-sm"
            >
              Next: See Examples →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Intro Page 2: Examples ────────────────────────────────────────────────────

function IntroPage2({ onNext, hideNext }: { onNext: () => void; hideNext?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hideNext) return;
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
        clearTimeout(timer);
        timer = setTimeout(onNext, 350);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [onNext, hideNext]);

  const examples = [
    {
      label: "Example 1",
      title: "Preselected Radio Buttons",
      src: "/example/Picture1.png",
      description:
        "Shows a user interface where radio button options are preselected by default, requiring users to actively change the default selection if they prefer an alternative option.",
    },
    {
      label: "Example 2",
      title: "Data Sharing Enabled by Default",
      src: "/example/Picture2.png",
      description:
        'Shows a user interface where the "Send Usage Information" setting is enabled by default, requiring users to opt out of data sharing rather than actively opting in.',
    },
    {
      label: "Example 3",
      title: "Preselected Trial Subscription",
      src: "/example/Picture3.png",
      description:
        'Shows a user interface where the "7-Day Free Trial" subscription option is highlighted and preselected, encouraging users toward a particular choice through a predefined default selection.',
    },
  ];

  return (
    <div ref={ref} className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10 pb-28">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
          {/* Examples · 2 of 3 */}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Example Bad Defaults</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Examples of the Bad Default (Preselection) Dark Pattern.
        </p>

        <div className="space-y-6">
          {examples.map(({ label, title, src, description }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex gap-5 flex-wrap"
            >
              <div className="shrink-0 w-36">
                <Image
                  src={src}
                  alt={title}
                  width={144}
                  height={256}
                  className="rounded-xl object-contain w-full h-auto shadow-sm border border-gray-100"
                />
              </div>
              <div className="flex-1 min-w-40">
                <span className="inline-block text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full mb-2">
                  {label}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {!hideNext && (
          <div className="flex flex-col items-center gap-1.5 pt-8">
            <button
              onClick={onNext}
              className="rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-sm"
            >
              Next: Your Task →
            </button>
            <p className="text-xs text-gray-400">or scroll to continue</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Intro Page 3: Task Instructions ──────────────────────────────────────────

function IntroPage3({
  onAction,
  actionLabel,
  loading,
  error,
}: {
  onAction: () => void;
  actionLabel: string;
  loading?: boolean;
  error?: string;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10 pb-28">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
          {/* Yof 3our Task · 3  */}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Task</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          You will be shown a series of UI screenshots. For each screenshot, complete the following
          steps:
        </p>

        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Determine Whether a Bad Default Is Present
              </h3>
            </div>
            <div className="ml-10 flex gap-3 flex-wrap">
              <div className="flex-1 min-w-30 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                <strong>Yes</strong> — The interface contains a Bad Default (Preselection) dark
                pattern.
              </div>
              <div className="flex-1 min-w-30 rounded-xl bg-green-50 border border-green-100 px-3 py-2 text-sm text-green-700">
                <strong>No</strong> — The interface does not contain a Bad Default (Preselection)
                dark pattern.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Rate Your Confidence</h3>
            </div>
            <div className="ml-10 flex gap-3 flex-wrap">
              {([
                [1, "Very unsure"],
                [2, "Unsure"],
                [3, "Neutral"],
                [4, "Sure"],
                [5, "Very sure"],
              ] as [number, string][]).map(([n, label]) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full border-2 border-blue-300 bg-blue-50 text-blue-700 text-sm font-semibold flex items-center justify-center">
                    {n}
                  </div>
                  <span className="text-[10px] text-gray-400 text-center w-12">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Add Optional Notes</h3>
            </div>
            <p className="ml-10 text-sm text-gray-600">
              You may provide comments, observations, uncertainties, or rationale for your decision.
            </p>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-orange-400 shrink-0" />
            <h2 className="text-base font-semibold text-gray-900">Important Notes</h2>
          </div>
          <ul className="ml-3 space-y-2">
            {[
              "Screenshots have been randomized.",
              "Screenshots originate from multiple sources; source information will not be disclosed during the study.",
              "Please rely on your professional judgment.",
              "There are no trick questions.",
              "Your progress will be saved automatically.",
              "Because this study contains a large number of screenshots, we strongly encourage you to complete the evaluation across multiple sessions rather than in a single sitting.",
              "We also recommend taking periodic breaks to reduce fatigue and improve rating quality.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-center text-sm text-gray-400 italic mb-6">
          Thank you for your valuable contribution to this research.
        </p>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        <div className="flex justify-center">
          <button
            onClick={onAction}
            disabled={loading}
            className="rounded-xl bg-orange-500 px-10 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Starting…" : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── IntroFlow ─────────────────────────────────────────────────────────────────

export type IntroFlowProps = {
  onClose: () => void;
  onComplete?: () => void;
  loading?: boolean;
  error?: string;
  initialPage?: 0 | 1 | 2;
  standalone?: boolean;
};

export default function IntroFlow({
  onClose,
  onComplete,
  loading = false,
  error = "",
  initialPage = 0,
  standalone = false,
}: IntroFlowProps) {
  const [page, setPage] = useState<number>(initialPage);
  const transitioningRef = useRef(false);

  const goTo = useCallback((target: number) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setPage(Math.min(2, Math.max(0, target)));
    setTimeout(() => { transitioningRef.current = false; }, 600);
  }, []);

  const goNext = useCallback(() => goTo(page + 1), [goTo, page]);
  const goPrev = useCallback(() => goTo(page - 1), [goTo, page]);

  const closeButton = (
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-700 transition flex items-center justify-end"
      aria-label="Close"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  // ── Standalone modal: single page, no slider or navigation ───────────────────
  if (standalone) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
        <div className="shrink-0 flex items-center justify-end px-6 py-3 border-b border-gray-100">
          {closeButton}
        </div>
        <div className="flex-1 overflow-hidden">
          {page === 0 && <IntroPage1 onNext={goNext} hideNext />}
          {page === 1 && <IntroPage2 onNext={goNext} hideNext />}
          {page === 2 && (
            <IntroPage3
              onAction={onClose}
              actionLabel="Close"
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    );
  }

  // ── Full flow: sliding 3-page experience ──────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <button
          onClick={goPrev}
          disabled={page === 0}
          className="text-sm text-gray-400 hover:text-gray-700 transition disabled:invisible flex items-center gap-1 w-20"
        >
          ← Back
        </button>
        <PageDots current={page} total={3} onSelect={goTo} />
        <div className="w-20 flex justify-end">{closeButton}</div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ width: "300vw", transform: `translateX(-${page * 100}vw)` }}
        >
          <div className="h-full shrink-0" style={{ width: "100vw" }}>
            <IntroPage1 onNext={goNext} />
          </div>
          <div className="h-full shrink-0" style={{ width: "100vw" }}>
            <IntroPage2 onNext={goNext} />
          </div>
          <div className="h-full shrink-0" style={{ width: "100vw" }}>
            <IntroPage3
              onAction={onComplete ?? onClose}
              actionLabel={onComplete ? "Start Evaluation" : "Close"}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
