import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }
  const rater = await prisma.rater.findUnique({ where: { id: Number(id) } });
  if (!rater) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rater);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const rater = await prisma.rater.upsert({
      where: { email: email.trim().toLowerCase() },
      update: { name: name.trim() },
      create: { name: name.trim(), email: email.trim().toLowerCase() },
    });

    return NextResponse.json(rater);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
