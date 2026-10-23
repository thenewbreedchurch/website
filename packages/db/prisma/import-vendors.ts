// One-off importer for the original directory app's CSV export.
//
//   pnpm --filter @nb-church/db import:vendors -- /path/to/vendors-2026-10-20.csv
//
// Idempotent on slug: re-running updates the same vendors instead of
// duplicating them. Imported listings have NO owner (owners claim them by
// signing up with the listing's email, or an admin assigns one). The CSV's
// owner_id / admin_notes / counters / ids are deliberately NOT imported.
import fs from "node:fs";
import { DIRECTORY_CATEGORIES, slugify } from "./directory-categories";

type IndexModule = typeof import("../index");
let prisma: IndexModule["prisma"];

async function loadPrisma(): Promise<IndexModule["prisma"]> {
  if (!process.env.DATABASE_URL) {
    const path = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const { config: loadEnv } = await import("dotenv");
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    loadEnv({ path: path.join(__dirname, "..", "..", "..", ".env") });
  }
  return (await import("../index")).prisma;
}

/** Minimal RFC 4180 parser (quoted fields, escaped quotes, newlines inside quotes). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((v) => v !== "")) rows.push(row);
  }
  return rows;
}

const blank = (v: string | undefined) => (v && v.trim() !== "" ? v.trim() : null);
const bool = (v: string | undefined) => (v ?? "").trim().toLowerCase() === "true";

const STATUS_MAP: Record<string, "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"> = {
  approved: "APPROVED",
  pending: "PENDING",
  rejected: "REJECTED",
  suspended: "SUSPENDED",
};

async function main() {
  const file = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!file) throw new Error("Usage: import:vendors -- <path-to-csv>");
  prisma = await loadPrisma();

  const [header, ...records] = parseCsv(fs.readFileSync(file, "utf8"));
  const col = (r: string[], name: string) => r[header.indexOf(name)];

  // Make sure every category exists first (keeps the fixed display order).
  const categoryIds = new Map<string, string>();
  for (const [i, c] of DIRECTORY_CATEGORIES.entries()) {
    const cat = await prisma.vendorCategory.upsert({
      where: { slug: slugify(c.name) },
      update: {},
      create: { name: c.name, slug: slugify(c.name), sortOrder: i, subcategories: c.subcategories },
    });
    categoryIds.set(c.name, cat.id);
  }

  let created = 0;
  let updated = 0;
  for (const r of records) {
    const name = blank(col(r, "business_name"));
    const categoryName = blank(col(r, "category"));
    if (!name || !categoryName) {
      console.warn("skipping row without name/category");
      continue;
    }
    let categoryId = categoryIds.get(categoryName);
    if (!categoryId) {
      const cat = await prisma.vendorCategory.create({
        data: { name: categoryName, slug: slugify(categoryName), sortOrder: categoryIds.size, subcategories: [] },
      });
      categoryId = cat.id;
      categoryIds.set(categoryName, cat.id);
    }

    const year = Number(col(r, "year_started"));
    const data = {
      businessName: name,
      status: STATUS_MAP[(col(r, "status") ?? "").toLowerCase()] ?? "PENDING",
      isVerified: bool(col(r, "is_verified")),
      isFeatured: bool(col(r, "is_featured")),
      categoryId,
      subcategory: blank(col(r, "subcategory")),
      description: blank(col(r, "description")) ?? "",
      services: (col(r, "services") ?? "").split(";").map((s) => s.trim()).filter(Boolean),
      location: blank(col(r, "location")) ?? "",
      serviceAreas: blank(col(r, "service_areas")),
      yearStarted: Number.isInteger(year) && year > 1900 ? year : null,
      isRegistered: bool(col(r, "is_registered")),
      registrationNumber: blank(col(r, "registration_number")),
      phone: blank(col(r, "phone")),
      whatsapp: blank(col(r, "whatsapp")),
      email: blank(col(r, "email"))?.toLowerCase() ?? null,
      website: blank(col(r, "website")),
      instagram: blank(col(r, "instagram")),
      facebook: blank(col(r, "facebook")),
      linkedin: blank(col(r, "linkedin")),
      tiktok: blank(col(r, "tiktok")),
      businessHours: blank(col(r, "business_hours")),
      priceRange: blank(col(r, "price_range")),
    };

    const slug = slugify(name);
    const existing = await prisma.vendor.findUnique({ where: { slug } });
    if (existing) {
      await prisma.vendor.update({ where: { slug }, data });
      updated++;
    } else {
      await prisma.vendor.create({ data: { ...data, slug } });
      created++;
    }
  }
  console.log(`Vendors imported: ${created} created, ${updated} updated (${records.length} rows).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
