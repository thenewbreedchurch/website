import { EmailButton, EmailLayout, P, Title } from "./components/email-layout";

export interface DirectoryActionEmailProps {
  preview: string;
  title: string;
  /** Paragraphs rendered as plain, auto-escaped text. */
  body: string[];
  buttonLabel?: string;
  url?: string;
  footerNote?: string;
  eyebrow?: string;
}

// One simple "title, a few lines, one button" layout shared by the directory's
// transactional emails (verify email, reset password, admin notices).
export default function DirectoryActionEmail({ preview, title, body, buttonLabel, url, footerNote, eyebrow = "Marketplace" }: DirectoryActionEmailProps) {
  return (
    <EmailLayout preview={preview} eyebrow={eyebrow} orgName="The New Breed Church" footerNote={footerNote}>
      <Title>{title}</Title>
      {body.map((line, i) => (
        <P key={i}>{line}</P>
      ))}
      {buttonLabel && url && (
        <div style={{ marginTop: 8 }}>
          <EmailButton href={url}>{buttonLabel}</EmailButton>
        </div>
      )}
    </EmailLayout>
  );
}
