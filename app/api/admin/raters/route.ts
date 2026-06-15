import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const raters = await prisma.rater.findMany({
      include: { _count: { select: { ratings: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(raters);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
