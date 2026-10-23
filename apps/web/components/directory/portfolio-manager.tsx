"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import { addPortfolioImageAction, deletePortfolioImageAction } from "@/actions/directory-upload";

export function PortfolioManager({
  images,
  max,
}: {
  images: { id: string; url: string; caption: string | null }[];
  max: number;
}) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    start(async () => {
      const res = await addPortfolioImageAction(fd);
      setMessage({ ok: res.ok, text: res.ok ? (res.message ?? "Photo added.") : res.error });
      if (ref.current) ref.current.value = "";
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={pending || images.length >= max}
          onClick={() => ref.current?.click()}
          className="inline-flex h-11 items-center gap-2 rounded-none bg-brand-700 px-6 text-sm font-bold uppercase tracking-tight text-white hover:bg-brand-800 disabled:opacity-60"
        >
          <Upload size={16} /> {pending ? "Uploading…" : "Add a photo"}
        </button>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />
        <p className="t-eyebrow text-[11px] text-current/60">
          {images.length} / {max} photos · JPEG, PNG or WebP, up to 8&nbsp;MB
        </p>
      </div>
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`mt-3 text-sm ${message.ok ? "" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      {images.length === 0 ? (
        <p className="t-body mt-8 border border-dashed border-current/25 p-8 text-center text-sm text-current/70">
          No photos yet. Show off your best work — businesses with photos get far more taps.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <li key={img.id} className="group relative aspect-square overflow-hidden bg-brand-50 dark:bg-white/5">
              <Image src={img.url} alt={img.caption ?? "Portfolio photo"} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => {
                  if (window.confirm("Remove this photo?")) start(async () => { await deletePortfolioImageAction(img.id); router.refresh(); });
                }}
                className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center bg-night/80 text-white hover:bg-red-600"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
