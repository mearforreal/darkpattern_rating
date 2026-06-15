import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    const ratings = await prisma.rating.findMany({
      include: { rater: true, image: true },
      orderBy: [{ rater: { email: "asc" } }, { image: { order: "asc" } }],
    });

    const header = "rater_name,rater_email,image_filename,is_dark_pattern,confidence,comment,created_at,updated_at\n";
    const rows = ratings.map((r) =>
      [
        escapeCsv(r.rater.name),
        escapeCsv(r.rater.email),
        escapeCsv(r.image.filename),
        escapeCsv(r.isDarkPattern),
        escapeCsv(String(r.confidence)),
        escapeCsv(r.comment),
        escapeCsv(r.createdAt.toISOString()),
        escapeCsv(r.updatedAt.toISOString()),
      ].join(",")
    );

    const csv = header + rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ratings-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
