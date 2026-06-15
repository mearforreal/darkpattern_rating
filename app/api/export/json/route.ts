import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ratings = await prisma.rating.findMany({
      include: { rater: true, image: true },
      orderBy: [{ rater: { email: "asc" } }, { image: { order: "asc" } }],
    });

    return new NextResponse(JSON.stringify(ratings, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="ratings-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
