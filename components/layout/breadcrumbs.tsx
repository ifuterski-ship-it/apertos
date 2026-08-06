import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.3em]">
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-neutral-700">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="text-neutral-500 transition hover:text-neutral-200">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-neutral-300">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
