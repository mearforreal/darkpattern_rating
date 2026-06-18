import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const raters = await prisma.rater.findMany({
      include: {
        _count: { select: { ratings: true } },
        ratings: { select: { responseTimeMs: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const result = raters.map((r) => {
      const timings = r.ratings
        .map((rt) => rt.responseTimeMs)
        .filter((t): t is number => t != null);
      const avgTaskMs =
        timings.length > 0
          ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length)
          : null;
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        createdAt: r.createdAt,
        sessionStartedAt: r.sessionStartedAt,
        sessionCompletedAt: r.sessionCompletedAt,
        _count: r._count,
        avgTaskMs,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
