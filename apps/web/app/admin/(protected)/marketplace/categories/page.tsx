import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteRowButton } from "@/components/admin/delete-button";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/actions/admin/vendors";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.vendorCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { vendors: true } } },
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Marketplace · Categories"
        description="The categories businesses are listed under. Lower sort numbers appear first."
      />

      <section className="max-w-2xl border border-neutral-200 p-5 admin-dark:border-neutral-800">
        <h2 className="t-eyebrow text-brand-700 admin-dark:text-brand-300">Add a category</h2>
        <div className="mt-4">
          <CategoryForm action={createCategoryAction} submitLabel="Add category" />
        </div>
      </section>

      <ul className="max-w-2xl space-y-4">
        {categories.map((c) => (
          <li key={c.id} className="border border-neutral-200 p-5 admin-dark:border-neutral-800">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="t-eyebrow text-neutral-500 admin-dark:text-neutral-400">
                {c._count.vendors} business{c._count.vendors === 1 ? "" : "es"} · /{c.slug}
              </p>
              {c._count.vendors === 0 ? (
                <DeleteRowButton id={c.id} action={deleteCategoryAction} confirmMessage={`Delete the “${c.name}” category?`} />
              ) : (
                <span className="text-xs text-neutral-400">In use</span>
              )}
            </div>
            <CategoryForm category={c} action={updateCategoryAction.bind(null, c.id)} submitLabel="Save" />
          </li>
        ))}
      </ul>
    </div>
  );
}
