import Image from "next/image";
import { LinkButton } from "@/components/ui/link-button";

/** Friendly 404 shared by the root and (site) not-found routes. */
export function NotFoundView() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20 text-center text-[#17131f] sm:px-6">
      <div className="w-full max-w-xl">
        <Image
          src="/images/404.svg"
          alt="Two people holding a plug and a socket that don't connect"
          width={588}
          height={309}
          priority
          className="h-auto w-full"
        />
      </div>
      <h1 className="mt-10 max-w-2xl text-balance font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
        Oh no! You have wandered too far. We can&apos;t find this page.
      </h1>
      <p className="t-body mt-5 max-w-md text-[#17131f]/70">
        It might have expired or you might have typed the link incorrectly.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <LinkButton href="/" shape="square" size="lg">
          Go to home
        </LinkButton>
        <LinkButton
          href="/contact"
          variant="outline"
          shape="square"
          size="lg"
          className="border-[#17131f]/40 text-[#17131f] hover:bg-[#17131f]/5"
        >
          Contact us
        </LinkButton>
      </div>
    </section>
  );
}
