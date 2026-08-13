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
  // Announcement.endDateTime and .registrationDeadline are DateTime? in
  // the schema, not String? — deliberately excluded here (an "= ''"
  // comparison against a timestamp column throws a Postgres type error).
  // Confirmed they were never actually affected by the empty-string bug
  // in the first place: actions/admin/announcements.ts already converts
  // via `d.endDateTime ? fromZonedTime(...) : null`, a truthy check that
  // treats "" and undefined identically, so both the old and new Zod
  // schema behavior produce the same correct `null` here regardless.
  { table: "Announcement", column: "recurrenceRule" },
  { table: "Announcement", column: "location" },
  { table: "Announcement", column: "onlineUrl" },
  { table: "Announcement", column: "heroImageUrl" },
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

  const results: Array<{ table: string; column: string; updated?: number; error?: string }> = [];
  for (const { table, column } of TARGETS) {
    try {
      const updated = await prisma.$executeRawUnsafe(
        `UPDATE "${table}" SET "${column}" = NULL WHERE "${column}" = ''`
      );
      results.push({ table, column, updated });
    } catch (err) {
      results.push({ table, column, error: (err as Error).message });
    }
  }

  const totalUpdated = results.reduce((sum, r) => sum + (r.updated ?? 0), 0);
  const errors = results.filter((r) => r.error);

  return (
    <pre>
      {JSON.stringify(
        { totalUpdated, errors, updatedRows: results.filter((r) => (r.updated ?? 0) > 0) },
        null,
        2
      )}
    </pre>
  );
}
