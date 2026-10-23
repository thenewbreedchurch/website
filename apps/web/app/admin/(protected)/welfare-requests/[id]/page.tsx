import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { WelfareStatusSelect } from "@/components/admin/welfare-status-select";
import { formatBytes } from "@/lib/welfare-attachments";
import { WelfareNotesForm } from "@/components/admin/welfare-notes-form";
import { DeleteRowButton } from "@/components/admin/delete-button";
import {
  deleteWelfareRequestAction,
  saveWelfareNotesAction,
  setWelfareStatusAction,
} from "@/actions/admin/welfare-requests";
import {
  WELFARE_DURATION_LABELS,
  WELFARE_GENDER_LABELS,
  WELFARE_MEMBERSHIP_STATUS_LABELS,
  describeSupport,
} from "@/lib/welfare";

const yn = (v: boolean) => (v ? "Yes" : "No");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-neutral-200 p-5 admin-dark:border-neutral-800">
      <h2 className="t-eyebrow text-brand-700 admin-dark:text-brand-300">{title}</h2>
      <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Item({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="t-eyebrow text-[10px] text-neutral-500 admin-dark:text-neutral-400">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm">{children}</dd>
    </div>
  );
}

export default async function WelfareRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await prisma.welfareRequest.findUnique({
    where: { id },
    // Never select the file bytes here — only metadata; downloads go through the files route.
    include: { attachments: { select: { id: true, filename: true, mimeType: true, size: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!r) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={r.fullName}
        description={`Submitted ${r.createdAt.toLocaleString()}`}
        breadcrumbs={[{ label: "Welfare Requests", href: "/admin/welfare-requests" }, { label: r.fullName }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border border-neutral-200 p-4 admin-dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <span className="t-eyebrow text-neutral-500 admin-dark:text-neutral-400">Status</span>
          <WelfareStatusSelect id={r.id} status={r.status} action={setWelfareStatusAction} />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a href={`mailto:${r.email}`} className="text-brand-700 underline admin-dark:text-brand-300">
            Email applicant
          </a>
          <a href={`tel:${r.phone.replace(/\s+/g, "")}`} className="text-brand-700 underline admin-dark:text-brand-300">
            Call
          </a>
          <DeleteRowButton
            id={r.id}
            action={deleteWelfareRequestAction}
            confirmMessage="Permanently delete this welfare request? This cannot be undone."
          />
        </div>
      </div>

      {r.attachments.length > 0 && (
        <section className="border border-neutral-200 p-5 admin-dark:border-neutral-800">
          <h2 className="t-eyebrow text-brand-700 admin-dark:text-brand-300">Documents ({r.attachments.length})</h2>
          <ul className="mt-4 divide-y divide-neutral-200 admin-dark:divide-neutral-800">
            {r.attachments.map((a) => {
              const previewable = ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(a.mimeType);
              const base = `/admin/welfare-requests/${r.id}/files/${a.id}`;
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 break-all">
                    📎 <span className="font-medium">{a.filename}</span>{" "}
                    <span className="text-neutral-500 admin-dark:text-neutral-400">· {formatBytes(a.size)}</span>
                  </span>
                  <span className="flex gap-4">
                    {previewable && (
                      <a href={`${base}?inline=1`} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline admin-dark:text-brand-300">
                        Preview
                      </a>
                    )}
                    <a href={base} className="font-medium text-brand-700 underline admin-dark:text-brand-300">
                      Download
                    </a>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Section title="Applicant information">
        <Item label="Full name">{r.fullName}</Item>
        <Item label="Email">{r.email}</Item>
        <Item label="Phone">{r.phone}</Item>
        <Item label="Occupation">{r.occupation}</Item>
        <Item label="Gender / age">
          {WELFARE_GENDER_LABELS[r.gender]}, {r.age}
        </Item>
        <Item label="Address" wide>
          {r.address}
        </Item>
      </Section>

      <Section title="Membership">
        <Item label="Membership status">{WELFARE_MEMBERSHIP_STATUS_LABELS[r.membershipStatus]}</Item>
        <Item label="Duration">{WELFARE_DURATION_LABELS[r.membershipDuration]}</Item>
        <Item label="Fellowship group">{r.fellowshipGroup}</Item>
        <Item label="Registered workforce member">
          {yn(r.isWorker)}
          {r.isWorker && r.department ? ` — ${r.department}` : ""}
        </Item>
      </Section>

      <Section title="Nature of assistance required">
        <Item label="Support type">{describeSupport(r.supportType, r.supportOther)}</Item>
        <Item label="Specific request">{r.specificRequest}</Item>
        <Item label="Description of situation" wide>
          {r.description}
        </Item>
      </Section>

      <Section title="Verification">
        <Item label="First time receiving TNBC support">{yn(r.firstTimeSupport)}</Item>
        {!r.firstTimeSupport && (
          <>
            <Item label="Date of last assistance">{r.lastAssistanceDate ? r.lastAssistanceDate.toLocaleDateString() : "—"}</Item>
            <Item label="Nature of last assistance">
              {r.lastAssistanceType ? describeSupport(r.lastAssistanceType, r.lastAssistanceOther) : "—"}
            </Item>
          </>
        )}
        <Item label="Resolutions tried besides this" wide>
          {r.triedElsewhere}
        </Item>
        <Item label="Has dependents">
          {yn(r.hasDependents)}
          {r.hasDependents ? ` — ${r.dependentsCount ?? "?"} (ages: ${r.dependentsAges ?? "—"})` : ""}
        </Item>
        <Item label="Home visit allowed">{yn(r.homeVisitOk)}</Item>
      </Section>

      <section className="border border-neutral-200 p-5 admin-dark:border-neutral-800">
        <h2 className="t-eyebrow text-brand-700 admin-dark:text-brand-300">Internal notes</h2>
        <div className="mt-4">
          <WelfareNotesForm defaultValue={r.adminNotes ?? ""} action={saveWelfareNotesAction.bind(null, r.id)} />
        </div>
      </section>
    </div>
  );
}
