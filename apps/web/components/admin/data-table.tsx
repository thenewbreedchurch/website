import { cn } from "@/lib/utils";

// Wrapped in its own horizontal-scroll container rather than letting the
// page scroll sideways on mobile — wide admin tables are the classic mobile
// breakage point.
export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-neutral-200 bg-brand-50/40 text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-brand-500/10 dark:text-neutral-400">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">{children}</tbody>;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400">
        {children}
      </td>
    </tr>
  );
}

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      {page > 1 && (
        <a href={`${basePath}?page=${page - 1}`} className="text-brand-700 hover:underline dark:text-brand-300">
          Previous
        </a>
      )}
      <span className="text-neutral-500 dark:text-neutral-400">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <a href={`${basePath}?page=${page + 1}`} className="text-brand-700 hover:underline dark:text-brand-300">
          Next
        </a>
      )}
    </div>
  );
}
