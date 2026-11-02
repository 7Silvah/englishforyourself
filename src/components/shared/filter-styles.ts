// Estilos de filtros compartidos (regla de U2, ver /dev/ui). Son clases y no componentes
// para que cada pantalla las ponga en su propio <Link> tipado de TanStack Router, igual que
// buttonVariants de shadcn.
import { cva } from "class-variance-authority";

/** Opción de un control segmentado (Nivel, Tipo…): dentro de <Segmented> */
export const segmentedItem = cva(
  "rounded-md px-2.5 py-1 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
  {
    variants: {
      active: {
        true: "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
        false: "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
    },
    defaultVariants: { active: false },
  },
);

/** Chip de un filtro aplicado («Nivel: C1 ×»): al pulsarlo se quita el filtro */
export const filterChip = cva(
  "inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-sm text-primary transition-colors outline-none hover:bg-primary/20 focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.5",
);
