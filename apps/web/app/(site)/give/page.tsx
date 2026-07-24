import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { CopyAccountButton } from "@/components/give/copy-account-button";
import { RevealSection } from "@/components/journey/reveal-section";
import { TiltCard } from "@/components/journey/tilt-card";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Give",
    description:
      "Support The New Breed Church through tithes, offerings, and the Favoured Fund entrepreneur-support initiative.",
    path: "/give",
  });
}

export default async function GivePage() {
  const accounts = await prisma.givingAccount.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const funds = groupByFund(accounts);

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <span className="give-bg-text">Give</span>
        <span className="give-bg-text">Give</span>
        <span className="give-bg-text">Give</span>
      </div>

      <section className="relative z-10 bg-brand-900 py-20 text-white">
        <Container className="max-w-3xl text-center">
          <HeartHandshake size={32} className="mx-auto text-brand-200" />
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Give</h1>
          <p className="mt-4 text-lg text-white/85">
            Giving is a timeless principle that connects you deeper with God, because God
            is a giver. Giving also opens up avenues for blessing and prosperity in your
            life.
          </p>
        </Container>
      </section>

      <section className="relative z-10 py-16">
        <Container className="space-y-14">
          {funds.map((fund) => (
            <RevealSection key={fund.name}>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{fund.name}</h2>
              {fund.name === "Favoured Fund" && (
                <p className="mt-3 max-w-2xl text-current/75">
                  Join The New Breed Church in supporting emerging entrepreneurs with at
                  least &#8358;1.5 million each, or register as an entrepreneur to receive
                  funding.{" "}
                  <a
                    href="https://ffp.thenewbreedchurch.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                  >
                    Learn more
                  </a>
                  .
                </p>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {fund.accounts.map((account) => (
                  <TiltCard key={account.id}>
                    <div className="rounded-2xl border border-border border-l-4 border-l-brand-600 bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                        {account.currency} Account
                      </p>
                      <dl className="mt-4 divide-y divide-border text-sm">
                        <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                          <dt className="text-current/60">Account No.</dt>
                          <dd className="flex items-center gap-2">
                            <span className="rounded-md bg-surface-muted px-2 py-1 font-mono font-medium">
                              {account.accountNumber}
                            </span>
                            <CopyAccountButton value={account.accountNumber} />
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 py-2.5">
                          <dt className="text-current/60">Bank</dt>
                          <dd className="font-medium">{account.bankName}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-3 py-2.5 last:pb-0">
                          <dt className="shrink-0 text-current/60">Account Name</dt>
                          <dd className="text-right font-medium">{account.accountName}</dd>
                        </div>
                      </dl>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </RevealSection>
          ))}

          {funds.length === 0 && (
            <p className="text-current/70">
              Giving details are being updated — please check back shortly, or contact us
              directly.
            </p>
          )}
        </Container>
      </section>
    </div>
  );
}

function groupByFund(accounts: Awaited<ReturnType<typeof prisma.givingAccount.findMany>>) {
  const order: string[] = [];
  const byFund = new Map<string, typeof accounts>();

  for (const account of accounts) {
    if (!byFund.has(account.fundName)) {
      byFund.set(account.fundName, []);
      order.push(account.fundName);
    }
    byFund.get(account.fundName)!.push(account);
  }

  return order.map((name) => ({ name, accounts: byFund.get(name)! }));
}
