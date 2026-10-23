import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";

/** Centered dark column used by every directory account page. */
export function DirectoryAuthShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <SectionBand tone="night" className="min-h-[70vh] !pt-16 sm:!pt-24">
      <div className="mx-auto max-w-md">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="t-display-sm mt-5">{title}</h1>
        {intro && <p className="t-body mt-5 text-sm text-white/75">{intro}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </SectionBand>
  );
}
