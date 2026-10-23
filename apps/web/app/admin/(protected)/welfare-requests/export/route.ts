import { NextResponse } from "next/server";
import { prisma } from "@nb-church/db";
import { getSessionFromCookie } from "@/lib/session";
import { toCsv } from "@/lib/csv";
import {
  WELFARE_DURATION_LABELS,
  WELFARE_GENDER_LABELS,
  WELFARE_MEMBERSHIP_STATUS_LABELS,
  WELFARE_STATUS_LABELS,
  describeSupport,
} from "@/lib/welfare";

const EXPORT_LIMIT = 5000;

export async function GET() {
  const user = await getSessionFromCookie();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const rows = await prisma.welfareRequest.findMany({ orderBy: { createdAt: "desc" }, take: EXPORT_LIMIT });
  const yn = (v: boolean) => (v ? "Yes" : "No");

  const csv = toCsv(
    [
      "Received", "Status", "Full name", "Email", "Phone", "Occupation", "Gender", "Age", "Address",
      "Membership status", "Duration", "Fellowship group", "Workforce member", "Department",
      "Support type", "Specific request", "Description", "First time support", "Last assistance date",
      "Last assistance type", "Tried elsewhere", "Has dependents", "Dependents count", "Dependents ages",
      "Home visit OK", "Internal notes",
    ],
    rows.map((r) => [
      r.createdAt.toISOString(),
      WELFARE_STATUS_LABELS[r.status],
      r.fullName,
      r.email,
      r.phone,
      r.occupation,
      WELFARE_GENDER_LABELS[r.gender],
      r.age,
      r.address,
      WELFARE_MEMBERSHIP_STATUS_LABELS[r.membershipStatus],
      WELFARE_DURATION_LABELS[r.membershipDuration],
      r.fellowshipGroup,
      yn(r.isWorker),
      r.department ?? "",
      describeSupport(r.supportType, r.supportOther),
      r.specificRequest,
      r.description,
      yn(r.firstTimeSupport),
      r.lastAssistanceDate ? r.lastAssistanceDate.toISOString().slice(0, 10) : "",
      r.lastAssistanceType ? describeSupport(r.lastAssistanceType, r.lastAssistanceOther) : "",
      r.triedElsewhere,
      yn(r.hasDependents),
      r.dependentsCount ?? "",
      r.dependentsAges ?? "",
      yn(r.homeVisitOk),
      r.adminNotes ?? "",
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="welfare-requests.csv"',
      "Cache-Control": "no-store",
    },
  });
}
