import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Fallback-avatar initials for a person's name, e.g. "Pastor Idowu Iluyomade" -> "PI". */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter((part) => part.length > 0 && part[0] === part[0].toUpperCase())
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
