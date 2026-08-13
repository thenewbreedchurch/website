import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";

// Temporary, one-time backfill for records saved before the
// admin-validation.ts empty-string fix: every "optional" field across
// every admin form was silently saving "" instead of NULL when left
// blank (a Zod union-ordering bug — see lib/admin-validation.ts). This
// converts existing "" values to NULL so public-facing `??` fallback
// chains (sermon thumbnail -> YouTube-derived -> static default, etc.)
// actually work for records saved before the fix. Remove this page once
// run against production.
const TARGETS: Array<{ table: string; column: string }> = [
  { table: "ChurchSettings", column: "mapEmbedUrl" },
  { table: "ChurchSettings", column: "facebookUrl" },
  { table: "ChurchSettings", column: "instagramUrl" },
  { table: "ChurchSettings", column: "youtubeUrl" },
  { table: "ChurchSettings", column: "tiktokUrl" },
  { table: "ChurchSettings", column: "livestreamUrl" },
  { table: "ChurchSettings", column: "memberRegistrationUrl" },
  { table: "ChurchSettings", column: "onlineMeetingUrl" },
  { table: "ServiceTime", column: "endTime" },
  { table: "ServiceTime", column: "onlineUrl" },
  { table: "ServiceTime", column: "location" },
  { table: "Announcement", column: "endDateTime" },
  { table: "Announcement", column: "recurrenceRule" },
  { table: "Announcement", column: "location" },
  { table: "Announcement", column: "onlineUrl" },
  { table: "Announcement", column: "heroImageUrl" },
  { table: "Announcement", column: "registrationDeadline" },
  { table: "Sermon", column: "series" },
  { table: "Sermon", column: "scripture" },
  { table: "Sermon", column: "description" },
  { table: "Sermon", column: "thumbnailUrl" },
  { table: "Testimony", column: "authorPhotoUrl" },
  { table: "GivingAccount", column: "swiftCode" },
  { table: "NextStep", column: "imageUrl" },
  { table: "NextStep", column: "ctaLabel" },
  { table: "NextStep", column: "ctaUrl" },
  { table: "StaffMember", column: "department" },
  { table: "StaffMember", column: "email" },
  { table: "StaffMember", column: "phone" },
  { table: "StaffMember", column: "photoUrl" },
  { table: "StaffMember", column: "bio" },
];

export default async function BackfillEmptyStringsPage() {
  await requireAdmin();

  const results: Array<{ table: string; column: string; updated: number }> = [];
  for (const { table, column } of TARGETS) {
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "${column}" = NULL WHERE "${column}" = ''`
    );
    results.push({ table, column, updated });
  }

  const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);

  return (
    <pre>{JSON.stringify({ totalUpdated, results: results.filter((r) => r.updated > 0) }, null, 2)}</pre>
  );
}
