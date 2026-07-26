// lucide-react dropped brand/trademarked icons (Instagram, YouTube, etc.) —
// these are small inline SVGs instead of pulling in a separate icon-set
// dependency just for two social glyphs.

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string };

export function InstagramIcon({ size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width={size}
      height={size}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// The real, standard YouTube brand mark — the rounded-rectangle "TV" body
// with the play triangle cut out of the *same* path (via winding order),
// not two separately-colored paths. Previously this used `currentColor`
// for the body and a hardcoded white triangle on top, which (once the
// triangle was fixed to a fixed white for dark-mode legibility in an
// earlier round) meant both ended up the same color in the footer's white
// wrapper — an invisible cutout, reading as a plain white blob rather than
// the recognizable logo. Fixed color (real YouTube red) so it's correct
// regardless of any wrapper's text color; footer.tsx no longer wraps this
// one in its own colored circle since the mark already carries its own
// color and (wider-than-tall) proportions.
export function YoutubeIcon({ size, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="#FF0000" width={size} height={size} {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
