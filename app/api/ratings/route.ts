import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const raterId = req.nextUrl.searchParams.get("raterId");
  if (!raterId || isNaN(Number(raterId))) {
    return NextResponse.json({ error: "Valid raterId is required" }, { status: 400 });
  }
  try {
    const ratings = await prisma.rating.findMany({
      where: { raterId: Number(raterId) },
      include: { image: true },
      orderBy: { image: { order: "asc" } },
    });
    return NextResponse.json(ratings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { raterId, imageId, isDarkPattern, confidence, comment } = await req.json();

    if (!raterId || !imageId) {
      return NextResponse.json({ error: "raterId and imageId are required" }, { status: 400 });
    }
    if (!["yes", "no"].includes(isDarkPattern)) {
      return NextResponse.json({ error: "isDarkPattern must be yes or no" }, { status: 400 });
    }
    if (!Number.isInteger(confidence) || confidence < 1 || confidence > 5) {
      return NextResponse.json({ error: "confidence must be 1-5" }, { status: 400 });
    }

    const rating = await prisma.rating.upsert({
      where: { raterId_imageId: { raterId: Number(raterId), imageId: Number(imageId) } },
      update: { isDarkPattern, confidence: Number(confidence), comment: comment ?? null },
      create: {
        raterId: Number(raterId),
        imageId: Number(imageId),
        isDarkPattern,
        confidence: Number(confidence),
        comment: comment ?? null,
      },
    });

    return NextResponse.json(rating);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
