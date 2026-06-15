import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

const IMAGE_DIR = path.join(process.cwd(), "public", "images");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

async function seed() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  if (!fs.existsSync(IMAGE_DIR)) {
    console.error(`Images directory not found: ${IMAGE_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(IMAGE_DIR)
    .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.log("No images found in public/images. Seed complete (nothing to do).");
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${files.length} image(s). Seeding...`);

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    await prisma.image.upsert({
      where: { filename },
      update: { order: i + 1 },
      create: { filename, order: i + 1 },
    });
    console.log(`  [${i + 1}/${files.length}] ${filename}`);
  }

  console.log("Seed complete.");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
