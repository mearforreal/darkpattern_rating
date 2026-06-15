"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYou() {
  const params = useSearchParams();
  const name = params.get("name") ?? "";
  const firstName = name.split(" ")[0];

  return (
    <main className="flex h-screen items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 text-5xl">🙏</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Thank you{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your ratings have been saved. We really appreciate your contribution to this research.
        </p>
      </div>
    </main>
  );
}

export default function DonePage() {
  return (
    <Suspense>
      <ThankYou />
    </Suspense>
  );
}
