import { EMAIL_LOGO_CID } from "../../lib/email-logos";
import { Body, Button, Column, Container, Head, Hr, Html, Img, Preview, Row, Section, Text } from "@react-email/components";

// Shared visual shell for every transactional email in apps/web/emails/.
// Mirrors the website: a near-black header band with the logo, a mono
// uppercase eyebrow, a white (or, in dark mode, deep-violet) card with a bold
// serif uppercase title, square violet buttons and mono labels.
//
// Email clients are hostile to modern CSS, so: layout is table-based
// (react-email's Section/Row/Column), every style needed to look right is
// inline, and the ONLY <style> block carries the dark-mode overrides and the
// small-screen tweak. Clients that ignore <style> (some Outlook builds) still
// get the full light-mode design. Class names (nb-*) exist purely as hooks
// for that block.


const NIGHT = "#0a0710";
const BRAND = "#6b46c1";
const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', 'Courier New', monospace";

const EMAIL_CSS = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  a { text-decoration: underline; }
  @media only screen and (max-width: 480px) {
    .nb-outer { padding: 0 !important; }
    .nb-card { padding: 24px 18px !important; }
    .nb-head { padding: 18px 18px !important; }
    .nb-foot { padding: 20px 18px 28px !important; }
    .nb-title { font-size: 22px !important; }
    .nb-btn { display: block !important; text-align: center !important; }
  }
  @media (prefers-color-scheme: dark) {
    .nb-body, .nb-body > table, .nb-body > table > tbody > tr > td { background-color: ${NIGHT} !important; }
    .nb-card { background-color: #17121f !important; border-color: #2c2438 !important; }
    .nb-title { color: #ffffff !important; }
    .nb-text, .nb-value { color: #e4def2 !important; }
    .nb-label { color: #c4b5fd !important; }
    .nb-link { color: #c4b5fd !important; }
    .nb-muted { color: #a79cbf !important; }
    .nb-rule { border-color: #2c2438 !important; }
    .nb-callout { background-color: #211a2e !important; color: #e4def2 !important; border-color: #8b5cf6 !important; }
    .nb-btn { background-color: #7c3aed !important; color: #ffffff !important; }
  }
`;

export function EmailLayout({
  preview,
  eyebrow,
  orgName,
  children,
  footerNote,
}: {
  preview: string;
  eyebrow: string;
  orgName: string;
  children: React.ReactNode;
  footerNote?: React.ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{EMAIL_CSS}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body className="nb-body" style={{ backgroundColor: "#f4f2f9", fontFamily: SANS, margin: 0, padding: 0 }}>
        <Container className="nb-outer" style={{ maxWidth: 600, width: "100%", margin: "0 auto", padding: "24px 12px" }}>
          <Section className="nb-head" style={{ backgroundColor: NIGHT, backgroundImage: `linear-gradient(${NIGHT}, ${NIGHT})`, borderTop: `4px solid ${BRAND}`, padding: "22px 28px 26px" }}>
            <Row>
              <Column style={{ width: 46, verticalAlign: "middle" }}>
                <Img src={`cid:${EMAIL_LOGO_CID.mark}`} width="40" height="40" alt="" style={{ display: "block", height: 40, width: "auto" }} />
              </Column>
              <Column style={{ verticalAlign: "middle" }}>
                <Img src={`cid:${EMAIL_LOGO_CID.wordmark}`} height="30" alt={orgName} style={{ display: "block", height: 30, width: "auto" }} />
              </Column>
            </Row>
            <Text
              style={{
                color: "#c4b5fd",
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: 2,
                lineHeight: "16px",
                textTransform: "uppercase",
                margin: "22px 0 0",
              }}
            >
              {eyebrow}
            </Text>
          </Section>

          <Section
            className="nb-card"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e7e3f0", borderTop: "none", padding: "32px 28px 28px" }}
          >
            {children}
          </Section>

          <Section className="nb-foot" style={{ padding: "22px 28px 8px" }}>
            <Text className="nb-muted" style={{ color: "#6d6382", fontFamily: MONO, fontSize: 11, letterSpacing: 0.4, lineHeight: "18px", margin: 0 }}>
              {footerNote ?? `This message was sent by ${orgName}.`}
            </Text>
            <Text className="nb-muted" style={{ color: "#8a7fa3", fontFamily: MONO, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", margin: "14px 0 0" }}>
              {orgName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---- shared content styles (inline) + dark-mode hooks (className) ----

/** Big serif uppercase heading, like the site's section titles. */
export const titleStyle = {
  color: "#17131f",
  fontFamily: SERIF,
  fontSize: 26,
  fontWeight: 700 as const,
  letterSpacing: -0.5,
  lineHeight: "1.1",
  textTransform: "uppercase" as const,
  margin: "0 0 18px",
};
export const textStyle = { color: "#33293f", fontSize: 15, lineHeight: 1.65, margin: "0 0 14px" };
/** Mono uppercase field label. */
export const labelStyle = {
  color: BRAND,
  fontFamily: MONO,
  fontSize: 10,
  fontWeight: 700 as const,
  letterSpacing: 1.4,
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};
export const valueStyle = { color: "#33293f", fontSize: 15, lineHeight: 1.5, margin: "0 0 18px", wordBreak: "break-word" as const };
export const linkStyle = { color: BRAND };

/** Page title. */
export function Title({ children }: { children: React.ReactNode }) {
  return (
    <Text className="nb-title" style={titleStyle}>
      {children}
    </Text>
  );
}

/** Body paragraph. */
export function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <Text className="nb-text" style={{ ...textStyle, ...style }}>
      {children}
    </Text>
  );
}

/** Label + value pair for the details grid. */
export function Field({ label, children, pre, last }: { label: string; children: React.ReactNode; pre?: boolean; last?: boolean }) {
  return (
    <>
      <Text className="nb-label" style={labelStyle}>
        {label}
      </Text>
      <Text className="nb-value" style={{ ...valueStyle, ...(pre ? { whiteSpace: "pre-wrap" as const } : {}), ...(last ? { margin: 0 } : {}) }}>
        {children}
      </Text>
    </>
  );
}

/** Section divider with an optional mono heading. */
export function SectionHeading({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Hr className="nb-rule" style={{ borderColor: "#e7e3f0", margin: "26px 0 20px" }} />
      {children && (
        <Text className="nb-label" style={{ ...labelStyle, fontSize: 11, letterSpacing: 2, margin: "0 0 18px" }}>
          {children}
        </Text>
      )}
    </>
  );
}

/** Square violet call-to-action. */
export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button
      href={href}
      className="nb-btn"
      style={{
        backgroundColor: BRAND,
        color: "#ffffff",
        fontFamily: SANS,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: -0.2,
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "15px 28px",
        display: "inline-block",
      }}
    >
      {children}
    </Button>
  );
}

/** Highlighted note with a violet left bar. */
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <Section className="nb-callout" style={{ backgroundColor: "#f4f2f9", borderLeft: `3px solid ${BRAND}`, padding: "12px 16px", margin: "0 0 18px" }}>
      <Text className="nb-text" style={{ ...textStyle, margin: 0, whiteSpace: "pre-wrap" as const }}>
        {children}
      </Text>
    </Section>
  );
}
