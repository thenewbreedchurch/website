import { cn } from "@/lib/utils";
import { Halo } from "./halo";

interface StaggeredHeadingProps {
  /** One entry per visual line; each later line is indented further. */
  lines: string[];
  as?: "h1" | "h2" | "h3";
  size?: "lg" | "sm";
  /** Index of the line that gets the halo scribble (its last word). */
  haloLine?: number;
  /** Tailwind color class for the halo stroke. */
  haloClassName?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * Display headline with each line stepped to the right and an optional halo —
 * the layout trick used on every section title at wearethenew.org. Renders a
 * single heading with a plain-text aria-label so the visual line breaks don't
 * fragment the accessible name.
 */
export function StaggeredHeading({
  lines,
  as: Tag = "h2",
  size = "lg",
  haloLine,
  haloClassName = "text-brand-300",
  align = "left",
  className,
}: StaggeredHeadingProps) {
  return (
    <Tag
      aria-label={lines.join(" ")}
      className={cn(size === "lg" ? "t-display" : "t-display-sm", className)}
    >
      {lines.map((line, i) => {
        const words = line.split(" ");
        const last = words.pop() ?? "";
        const showHalo = haloLine === i;
        return (
          <span
            key={i}
            aria-hidden="true"
            // The step-right stagger only applies from sm up; on phones every
            // line stays flush so wrapped lines never look skewed.
            className={cn(
              "block",
              align === "left"
                ? "sm:[padding-left:calc(var(--i)*0.9ch)]"
                : cn("text-center", i % 2 ? "sm:ml-[1ch]" : "sm:-ml-[1ch]")
            )}
            style={{ "--i": i } as React.CSSProperties}
          >
            {words.length > 0 && `${words.join(" ")} `}
            {showHalo ? (
              <span className="relative inline-block">
                {last}
                <Halo className={haloClassName} />
              </span>
            ) : (
              last
            )}
          </span>
        );
      })}
    </Tag>
  );
}
