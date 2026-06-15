import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const raters = await prisma.rater.findMany({
      orderBy: { name: "asc" },
      include: {
        ratings: {
          orderBy: { image: { order: "asc" } },
          include: { image: true },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Dark Pattern Rating App";
    workbook.created = new Date();

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } },
      alignment: { vertical: "middle", horizontal: "center" },
      border: {
        bottom: { style: "thin", color: { argb: "FF1E3A5F" } },
      },
    };

    for (const rater of raters) {
      // Truncate sheet name to 31 chars (Excel limit)
      const sheetName = rater.name.slice(0, 31);
      const sheet = workbook.addWorksheet(sheetName);

      sheet.columns = [
        { header: "Image", key: "filename", width: 32 },
        { header: "Dark Pattern?", key: "isDarkPattern", width: 16 },
        { header: "Confidence (1–5)", key: "confidence", width: 18 },
        { header: "Notes", key: "comment", width: 40 },
        { header: "Rated At", key: "ratedAt", width: 22 },
      ];

      // Style header row
      const headerRow = sheet.getRow(1);
      headerRow.height = 22;
      headerRow.eachCell((cell) => {
        Object.assign(cell, headerStyle);
      });

      for (const rating of rater.ratings) {
        const row = sheet.addRow({
          filename: rating.image.filename,
          isDarkPattern: rating.isDarkPattern,
          confidence: rating.confidence,
          comment: rating.comment ?? "",
          ratedAt: rating.updatedAt.toISOString().replace("T", " ").slice(0, 19),
        });

        // Colour-code the yes/no cell
        const dpCell = row.getCell("isDarkPattern");
        if (rating.isDarkPattern === "yes") {
          dpCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
          dpCell.font = { color: { argb: "FFB91C1C" } };
        } else if (rating.isDarkPattern === "no") {
          dpCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
          dpCell.font = { color: { argb: "FF065F46" } };
        }

        // Zebra striping on other cells
        if (row.number % 2 === 0) {
          row.eachCell((cell, col) => {
            if (col === 2) return; // skip isDarkPattern cell already styled
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
          });
        }
      }

      // Freeze the header row
      sheet.views = [{ state: "frozen", ySplit: 1 }];

      // Auto-filter on header
      sheet.autoFilter = { from: "A1", to: "E1" };

      // Summary row at the bottom
      if (rater.ratings.length > 0) {
        sheet.addRow([]);
        const yesCount = rater.ratings.filter((r) => r.isDarkPattern === "yes").length;
        const noCount = rater.ratings.filter((r) => r.isDarkPattern === "no").length;
        const avgConf =
          rater.ratings.reduce((s, r) => s + r.confidence, 0) / rater.ratings.length;
        const summaryRow = sheet.addRow({
          filename: `Total: ${rater.ratings.length} rated`,
          isDarkPattern: `Yes: ${yesCount} / No: ${noCount}`,
          confidence: `Avg: ${avgConf.toFixed(1)}`,
          comment: "",
          ratedAt: "",
        });
        summaryRow.font = { bold: true, italic: true, color: { argb: "FF6B7280" } };
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="ratings-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
