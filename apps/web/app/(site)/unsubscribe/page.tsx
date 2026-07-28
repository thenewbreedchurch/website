import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { UnsubscribeForm } from "./unsubscribe-form";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Unsubscribe",
    description: "Unsubscribe from The New Breed Church newsletter.",
    path: "/unsubscribe",
  });
}

// useSearchParams() inside UnsubscribeForm requires a Suspense boundary, or
// Next.js bails the whole route out of static rendering with a build-time
// warning — this is the officially documented fix, not a style choice.
export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeForm />
    </Suspense>
  );
}
