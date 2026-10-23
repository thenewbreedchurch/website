import { Link } from "@react-email/components";
import type {
  WelfareGender,
  WelfareMembershipDuration,
  WelfareMembershipStatus,
  WelfareSupportType,
} from "@nb-church/db";
import { Callout, EmailButton, EmailLayout, Field, P, SectionHeading, Title, linkStyle } from "./components/email-layout";
import {
  WELFARE_DURATION_LABELS,
  WELFARE_GENDER_LABELS,
  WELFARE_MEMBERSHIP_STATUS_LABELS,
  describeSupport,
} from "../lib/welfare";
import { formatBytes } from "../lib/welfare-attachments";

export interface WelfareRequestEmailProps {
  email: string;
  fullName: string;
  occupation: string;
  gender: WelfareGender;
  age: number;
  phone: string;
  address: string;
  membershipStatus: WelfareMembershipStatus;
  membershipDuration: WelfareMembershipDuration;
  fellowshipGroup: string;
  isWorker: boolean;
  department: string | null;
  supportType: WelfareSupportType;
  supportOther: string | null;
  description: string;
  specificRequest: string;
  firstTimeSupport: boolean;
  lastAssistanceDate: Date | null;
  lastAssistanceType: WelfareSupportType | null;
  lastAssistanceOther: string | null;
  triedElsewhere: string;
  hasDependents: boolean;
  dependentsCount: number | null;
  dependentsAges: string | null;
  homeVisitOk: boolean;
  /** Uploaded documents; `attached` is false when a file is too large to ride along on the email itself. */
  attachments: { filename: string; size: number; attached: boolean }[];
  /** Link to this request in the admin panel (always has every document). */
  adminUrl: string;
}

const yn = (v: boolean) => (v ? "Yes" : "No");

// Internal notification for the welfare team. Every value is user-supplied and
// rendered as a JSX child (auto-escaped) — never interpolated into raw HTML.
export default function WelfareRequestEmail(p: WelfareRequestEmailProps) {
  const notAttached = p.attachments.filter((a) => !a.attached);
  return (
    <EmailLayout
      preview={`New welfare request from ${p.fullName}`}
      eyebrow="Welfare — new request"
      orgName="The New Breed Church"
      footerNote="Confidential. This contains personal information shared with the welfare team on the understanding that it stays private. Reply to this email to reach the applicant."
    >
      <Title>{p.fullName} has submitted a welfare request</Title>
      <P>
        Support needed: <strong>{describeSupport(p.supportType, p.supportOther)}</strong> — {p.specificRequest}
      </P>
      <div style={{ margin: "4px 0 6px" }}>
        <EmailButton href={p.adminUrl}>Open in admin</EmailButton>
      </div>

      {p.attachments.length > 0 && (
        <>
          <SectionHeading>
            {notAttached.length > 0
              ? `Documents (${p.attachments.length} uploaded · ${p.attachments.length - notAttached.length} attached)`
              : `Documents (${p.attachments.length} attached)`}
          </SectionHeading>
          {p.attachments.map((a) => (
            <P key={a.filename} style={{ margin: "0 0 6px" }}>
              📎 <strong>{a.filename}</strong> · {formatBytes(a.size)} {a.attached ? "— attached to this email" : "— too large to attach, open it in admin"}
            </P>
          ))}
          {notAttached.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Callout>
                {notAttached.length === 1 ? "One document is" : `${notAttached.length} documents are`} too large to include in this email. Every
                document is stored securely — download {notAttached.length === 1 ? "it" : "them"} from the request in the admin panel.
              </Callout>
            </div>
          )}
        </>
      )}

      <SectionHeading>Applicant information</SectionHeading>
      <Field label="Full name">{p.fullName}</Field>
      <Field label="Email">
        <Link href={`mailto:${p.email}`} className="nb-link" style={linkStyle}>
          {p.email}
        </Link>
      </Field>
      <Field label="Phone">{p.phone}</Field>
      <Field label="Occupation">{p.occupation}</Field>
      <Field label="Gender / age">
        {WELFARE_GENDER_LABELS[p.gender]}, {p.age}
      </Field>
      <Field label="Address" pre last>
        {p.address}
      </Field>

      <SectionHeading>Membership</SectionHeading>
      <Field label="Membership status">{WELFARE_MEMBERSHIP_STATUS_LABELS[p.membershipStatus]}</Field>
      <Field label="Duration of membership">{WELFARE_DURATION_LABELS[p.membershipDuration]}</Field>
      <Field label="Fellowship group">{p.fellowshipGroup}</Field>
      <Field label="Registered workforce member" last>
        {yn(p.isWorker)}
        {p.isWorker && p.department ? ` — ${p.department}` : ""}
      </Field>

      <SectionHeading>Nature of assistance required</SectionHeading>
      <Field label="Support type">{describeSupport(p.supportType, p.supportOther)}</Field>
      <Field label="Specific request">{p.specificRequest}</Field>
      <Field label="Description of situation" pre last>
        {p.description}
      </Field>

      <SectionHeading>Verification</SectionHeading>
      <Field label="First time receiving TNBC support">{yn(p.firstTimeSupport)}</Field>
      {!p.firstTimeSupport && (
        <>
          <Field label="Date of last assistance">{p.lastAssistanceDate ? p.lastAssistanceDate.toLocaleDateString("en-NG") : "—"}</Field>
          <Field label="Nature of last assistance">
            {p.lastAssistanceType ? describeSupport(p.lastAssistanceType, p.lastAssistanceOther) : "—"}
          </Field>
        </>
      )}
      <Field label="Resolutions tried besides this" pre>
        {p.triedElsewhere}
      </Field>
      <Field label="Has dependents">
        {yn(p.hasDependents)}
        {p.hasDependents ? ` — ${p.dependentsCount ?? "?"} (ages: ${p.dependentsAges ?? "—"})` : ""}
      </Field>
      <Field label="Welfare member may visit home" last>
        {yn(p.homeVisitOk)}
      </Field>
    </EmailLayout>
  );
}
