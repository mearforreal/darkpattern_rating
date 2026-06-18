import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: "Valid id is required" },
      { status: 400 },
    );
  }
  const rater = await prisma.rater.findUnique({ where: { id: Number(id) } });
  if (!rater) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rater);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, sessionStartedAt, sessionCompletedAt } = body;

    if (id !== undefined) {
      const raterId = Number(id);
      if (!Number.isInteger(raterId) || raterId <= 0) {
        return NextResponse.json(
          { error: "Valid id is required" },
          { status: 400 },
        );
      }

      const updateData: Record<string, Date> = {};
      if (sessionStartedAt)
        updateData.sessionStartedAt = new Date(sessionStartedAt);
      if (sessionCompletedAt)
        updateData.sessionCompletedAt = new Date(sessionCompletedAt);

      const rater = await prisma.rater.update({
        where: { id: raterId },
        data: updateData,
      });
      return NextResponse.json(rater);
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    const rater = await prisma.rater.upsert({
      where: { email: normalizedEmail },
      update: {
        name: normalizedName,
        ...(sessionStartedAt
          ? { sessionStartedAt: new Date(sessionStartedAt) }
          : {}),
        ...(sessionCompletedAt
          ? { sessionCompletedAt: new Date(sessionCompletedAt) }
          : {}),
      },
      create: {
        name: normalizedName,
        email: normalizedEmail,
        ...(sessionStartedAt
          ? { sessionStartedAt: new Date(sessionStartedAt) }
          : {}),
        ...(sessionCompletedAt
          ? { sessionCompletedAt: new Date(sessionCompletedAt) }
          : {}),
      },
    });

    return NextResponse.json(rater);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
