import Image from "next/image";

// Split-screen shell for the public auth pages (login, forgot-password,
// reset-password, verify, session-timeout): a solid brand-gradient panel
// with a bold statement headline on wide screens (no photo — a flat
// gradient reads cleaner and avoids fighting with text legibility), form
// content in a left-aligned, borderless column on the right. Collapses to
// a plain centered column on narrower screens.
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <div className="relative hidden w-[42%] max-w-lg flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-12 lg:flex">
        <Image
          src="/logo-mark.png"
          alt="The New Breed Church"
          width={166}
          height={160}
          className="h-11 w-11 shrink-0 self-start object-contain"
        />

        <div>
          <p className="font-sans text-4xl font-bold leading-tight tracking-tight text-white">
            A place to grow
            <br />
            <span className="text-brand-300">in faith, hope, and love.</span>
          </p>
          <p className="mt-5 max-w-sm text-sm text-white/60">
            The admin panel behind The New Breed Church&apos;s announcements, sermons, and
            congregation care — keep it well tended.
          </p>
        </div>

        <p className="text-xs text-white/40">The New Breed Church — Admin</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
