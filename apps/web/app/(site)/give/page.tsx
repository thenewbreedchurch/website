import type { Metadata } from "next";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { SectionBand } from "@/components/ui/section-band";
import { PageHero } from "@/components/ui/page-hero";
import { CopyAccountButton } from "@/components/give/copy-account-button";
import { RevealSection } from "@/components/journey/reveal-section";

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
    <>
        <PageHero
          eyebrow="Give"
          lines={["Give", "with joy"]}
          image="/images/first-timers/first-timers-community-moment.jpg"
          tone="violet"
          description="Giving is a timeless principle that connects you deeper with God, because God is a giver. Giving also opens up avenues for blessing and prosperity in your life."
        />

        <SectionBand tone="white" className="relative isolate space-y-20 overflow-hidden">
          {/* The drifting "Give" backdrop — decorative, behind the fund cards. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <span className="give-bg-text">Give</span>
            <span className="give-bg-text">Give</span>
            <span className="give-bg-text">Give</span>
          </div>

          {funds.map((fund) => (
            <RevealSection key={fund.name}>
              <h2 className="t-display-sm">{fund.name}</h2>
              {fund.name === "Favoured Fund" && (
                <p className="t-body mt-5 max-w-2xl text-current/75">
                  Join The New Breed Church in supporting emerging entrepreneurs with at
                  least &#8358;1.5 million each, or register as an entrepreneur to receive
                  funding.{" "}
                  <a
                    href="https://ffp.thenewbreedchurch.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    Learn more
                  </a>
                  .
                </p>
              )}

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {fund.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="border border-border border-l-4 border-l-brand-600 bg-surface-muted p-6"
                  >
                    <p className="t-eyebrow text-brand-700 dark:text-brand-300">
                      {account.currency} Account
                    </p>
                    <dl className="mt-4 divide-y divide-border text-sm">
                      <div className="flex items-center justify-between gap-3 py-3 first:pt-0">
                        <dt className="t-eyebrow text-current/60">Account No.</dt>
                        <dd className="flex items-center gap-3">
                          <span className="font-mono text-base font-medium">
                            {account.accountNumber}
                          </span>
                          <CopyAccountButton value={account.accountNumber} />
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-3">
                        <dt className="t-eyebrow text-current/60">Bank</dt>
                        <dd className="font-semibold">{account.bankName}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3 py-3 last:pb-0">
                        <dt className="t-eyebrow shrink-0 text-current/60">Account Name</dt>
                        <dd className="text-right font-semibold">{account.accountName}</dd>
                      </div>
                    </dl>
                  </div>
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
        </SectionBand>
    </>
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
