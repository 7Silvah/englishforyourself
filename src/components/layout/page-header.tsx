import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-2 pb-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
