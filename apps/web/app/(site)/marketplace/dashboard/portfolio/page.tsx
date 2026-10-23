import Link from "next/link";
import { prisma } from "@nb-church/db";
import { requireDirectoryUser } from "@/lib/directory-session";
import { PortfolioManager } from "@/components/directory/portfolio-manager";
import { MAX_PORTFOLIO_IMAGES } from "@/lib/directory";

export default async function PortfolioPage() {
  const user = await requireDirectoryUser("/marketplace/dashboard/portfolio");
  const vendor = await prisma.vendor.findFirst({
    where: { ownerId: user.id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!vendor) {
    return (
      <p className="t-body max-w-md text-current/75">
        Create your listing first, then you can add photos of your work.{" "}
        <Link href="/marketplace/dashboard/listing" className="font-semibold underline">
          Create your listing
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="font-display text-3xl font-bold uppercase leading-none tracking-tight">Portfolio</h2>
      <PortfolioManager images={vendor.images.map((i) => ({ id: i.id, url: i.url, caption: i.caption }))} max={MAX_PORTFOLIO_IMAGES} />
    </div>
  );
}
