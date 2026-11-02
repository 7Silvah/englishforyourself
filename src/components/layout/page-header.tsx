import type { ReactNode } from "react";

// `actions`: botones a la derecha del título en pantallas anchas (debajo en el móvil)
export function PageHeader({
  title,
  description,
  children,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const text = (
    <div className="space-y-2">
      <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
  if (!actions) return <div className="pb-8">{text}</div>;
  return (
    <div className="mb-8 flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">{text}</div>
      <div className="flex flex-wrap gap-2 lg:shrink-0">{actions}</div>
    </div>
  );
}
