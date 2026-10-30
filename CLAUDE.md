# CLAUDE.md

Guía para trabajar en este repo. Léela entera antes de cambiar nada.

## Proyecto

App para **aprender inglés desde el español**. Usuarios: hispanohablantes,
de principiante (A1) a intermedio-alto (B2). La interfaz, las explicaciones
y los mensajes van en **español**; los ejemplos y el contenido que se aprende,
en **inglés**.

La app tiene tres pilares: el **Curso de Fundamentos** (estructura gramatical
explicada en español, unidad por unidad), los **ejercicios interactivos** (los
35 worksheets PDF migrados más ejercicios nuevos de 12 tipos) y la
**Biblioteca** (161 lecciones de consulta).

## Etapas y fases

El trabajo se organiza en **etapas** (lo que gana el estudiante) divididas en
**fases** (lo que se construye). Todo está en `docs/PLAN.md`.

- Antes de empezar una tarea, mira la tabla **Estado** del plan y la fase en curso.
- No adelantes trabajo de fases o etapas posteriores sin que te lo pidan. Si una idea no encaja en la fase actual, propón añadirla al backlog (§13).
- Una etapa no empieza hasta que se cumple el criterio de terminado de la anterior.
- Al terminar una tarea, marca su casilla. Al cerrar una fase o etapa, actualiza la tabla Estado.
- El sitio antiguo vive en `legacy/` hasta la fase F11.

## El usuario está aprendiendo

El dueño del repo usa este proyecto para aprender React y su ecosistema.

- Explica en español, en 1–3 frases, el **por qué** de cada decisión que no sea obvia (un hook, un patrón, una librería).
- Prefiere el patrón más simple que funcione: componentes + props, `useState`, funciones puras. Nada de abstracciones “por si acaso”.
- Antes de añadir una dependencia nueva, di qué problema resuelve y si existe una alternativa sin dependencia. Las librerías ya elegidas están en `docs/PLAN.md` §3.
- Si un cambio introduce un concepto nuevo (Suspense, `import.meta.glob`, Zustand `persist`…), menciónalo por su nombre para que se pueda buscar.

## Comandos

```bash
npm run dev            # http://localhost:5173
npm run build
npm run typecheck
npm run lint
npm test               # vitest
npm run e2e            # playwright
npm run content:check  # valida src/content/**
```

Antes de dar una tarea por terminada, ejecuta `npm run typecheck && npm run lint && npm test`.
Si tocaste `src/content/` o los esquemas, ejecuta también `npm run content:check`.
Informa del resultado real: si algo falla, muéstralo.

## Stack (no cambiar sin preguntar)

Vite 8 · React 19 · TypeScript 7 strict · oxlint + Prettier · Tailwind CSS v4 · shadcn/ui (Base UI) · lucide-react ·
TanStack Router (file-based) · MDX + Zod · Zustand · MiniSearch · @dnd-kit ·
Web Speech API · Vitest · Testing Library · Playwright.

Para dudas de API de estas librerías, consulta la documentación actual (Context7)
en lugar de fiarte de la memoria. Tailwind v4 y TanStack Router cambian a menudo.

## Dónde va cada cosa

| Carpeta | Contiene | Regla |
|---|---|---|
| `src/routes/` | Rutas de TanStack Router | Archivos delgados: leen params, piden contenido al manifiesto y renderizan. Sin lógica de negocio. |
| `src/components/ui/` | Componentes generados por shadcn | Se añaden con `npx shadcn@latest add <x>`. Edítalos lo mínimo y nunca los reescribas a mano desde cero. |
| `src/components/layout/` | Header, footer, breadcrumbs, theme toggle | |
| `src/components/lesson/` | Piezas de lección usadas desde MDX | Solo presentación; se registran en `mdx-components.tsx`. |
| `src/features/exercises/` | Motor de ejercicios: `schema.ts`, `check.ts`, `player/`, `types/` (un componente por tipo), `generators/` | Un tipo nuevo = esquema en la unión discriminada + componente en `types/` + tests. La corrección siempre pasa por `check.ts`. |
| `src/features/<x>/` | Otras funcionalidades con estado o lógica (course, progress, search, tense-lab, flashcards) | La lógica pura va en `logic.ts` con tests; el store en `store.ts`. |
| `src/content/` | Contenido como datos: unidades del curso, ejercicios, lecciones, wordlists, tablas, `tenses.ts` | Sin JSX salvo en `.mdx`. Todo pasa por los esquemas de Zod. |
| `src/i18n/es.ts` | Todos los textos de la UI | **Ningún texto de UI suelto en JSX.** |
| `src/lib/` | Utilidades puras (`cn`, `speak`, slugs) | |
| `src/hooks/` | Hooks compartidos (`use-theme`) | Si un archivo exporta un componente, el hook o el contexto van en otro archivo (lo exige fast refresh). |
| `src/dev/` | Páginas solo de desarrollo (`/dev/ui`) | Se cargan con `lazy` detrás de `import.meta.env.DEV`; nunca llegan al build. |

Importa con el alias `@/` (`@/components/ui/button`), nunca con `../../..`.

### Rutas (TanStack Router)

- Un archivo en `src/routes/` = una URL. `route.tsx` dentro de una carpeta es la ruta contenedora de ese nivel; `index.tsx` es su página; `$param.tsx` es un parámetro y `$.tsx` captura el resto de la URL (`_splat`).
- `src/routeTree.gen.ts` lo genera el plugin de Vite: **no se edita a mano**, pero se versiona.
- Para aparecer en los breadcrumbs, el `loader` de la ruta devuelve `{ crumb: "Texto" }`. Para el título de la pestaña, `head: () => ({ meta: [{ title: pageTitle("Texto") }] })`.
- Si un parámetro no corresponde a contenido existente, el `loader` lanza `notFound()`.
- Para leer datos de una ruta padre, usa `getRouteApi("/ruta/padre").useLoaderData()`.
- Enlaces siempre con `<Link to="…">` del router (tipado). Para que un enlace parezca botón: `className={buttonVariants()}`.

## Convenciones de código

- TypeScript strict. Sin `any` ni `as` para silenciar errores; valida con Zod lo que venga de fuera (JSON, `localStorage`, URL).
- Componentes de función, nombrados en PascalCase, un componente principal por archivo y exportación con nombre (`export function WordList`).
- Archivos en kebab-case (`grammar-table.tsx`), igual que los que genera shadcn.
- Identificadores de código en **inglés**; textos visibles en **español** (vía `es.ts`); comentarios en español y solo cuando expliquen un *por qué*.
- Estilos solo con clases de Tailwind y `cn()`. Nada de colores hex en componentes: usa los tokens (`bg-pos-soft`, `text-neg-ink`, `bg-primary`, `bg-subj border-subj-border text-subj-fg`, `bg-correct`). Están definidos en `src/index.css` y se ven todos en `/dev/ui`.
- Los componentes de shadcn usan **Base UI**: para que un trigger sea otro componente se usa `render={<Button />}`, no `asChild` (eso era Radix). Fíjate en esto al copiar ejemplos de internet.
- Estado: `useState` local → URL search params (filtros, tiempo verbal seleccionado) → Zustand solo para lo que persiste entre páginas (progreso, ajustes).
- Sin `useEffect` para derivar datos; calcula durante el render o usa `useMemo` si es caro.

## Reglas de contenido

- **No traduzcas ni reescribas los ejemplos en inglés** del contenido original. Si ves un error, señálalo y corrígelo en un commit aparte.
- Las traducciones van en campos `*Es` / `es`, en español **neutro** y con **tuteo**. Si no estás seguro de una traducción, déjala vacía antes que inventarla.
- Todo texto en inglés dentro de la UI lleva `lang="en"`.
- Los colores de modo gramatical son fijos en todo el sitio: **pos = verde**, **neg = naranja**, **q = amarillo**, `nq` = pregunta negativa. Úsalos siempre con texto o símbolo además del color.
- Bloques del Tense Lab: sujeto azul, auxiliar ámbar, verbo verde, objeto gris.
- Las explicaciones para hispanohablantes usan los componentes `Explain`, `CommonMistake`, `FalseFriend` y `Tip`, no HTML suelto.
- Los slugs de las lecciones no se cambian: hay redirecciones que dependen de ellos.

## Unidades del curso

- Siguen la plantilla de `docs/PLAN.md` §6.2, en este orden: objetivos, explicación con `Formula`, comparación con el español, errores comunes, práctica guiada, práctica libre, worksheet y repaso.
- Explicaciones cortas, en español y para principiantes. Si usas un término gramatical, defínelo la primera vez.
- Meta final: cada unidad con 40–60 ítems de al menos 4 tipos y un set de repaso. **Por ahora no se escriben en volumen**: la decisión D1 (`docs/PLAN.md` §14) está pendiente hasta que la app esté completa. Solo se crean sets de muestra (unos 5 ítems por tipo) para probar el motor. No generes más sin que te lo pidan.
- No introduzcas en una unidad estructuras que todavía no se han enseñado (por ejemplo, nada de pasado en las unidades 1–8).

## Reglas para escribir ejercicios

- Inglés natural y frecuente, con vocabulario del nivel de la unidad.
- Lista en `answers` **todas** las respuestas válidas: variantes UK/US y contracciones ambiguas (`'s`, `'d`). Las contracciones no ambiguas ya las acepta `check.ts`.
- `explanationEs` es obligatoria en los sets `original` y explica el porqué, no solo la respuesta.
- Los distractores son errores reales de hispanohablantes (*She don't*, *I have 20 years*), no opciones absurdas.
- Los sets que escribas tú quedan con `reviewed: false`. Solo el dueño del repo los marca como revisados (el proceso completo se define en D1).
- No modifiques el enunciado ni la clave de los sets `source: "worksheet"`. Solo puedes añadir respuestas válidas, `explanationEs` o corregir errores evidentes, y debes indicarlo en el commit.
- Después de tocar ejercicios, ejecuta `npm run content:check`.

## Accesibilidad

Componentes de shadcn (Base UI) para todo lo interactivo (diálogos, tabs, menús).
Los botones de solo icono llevan `aria-label` en español. El foco tiene que ser
visible y todo debe funcionar con teclado (ejercicios: Enter comprueba y pasa al
siguiente, fichas con Tab y Espacio; flashcards: Espacio para girar, 1/2 para
responder). El resultado de cada respuesta se anuncia con `aria-live`. Hay que mantener contraste AA en claro y en oscuro.

## Git

- Commits pequeños, con el mensaje en español y en imperativo (“Añadir buscador con MiniSearch”).
- El contenido generado por scripts va en un commit separado del código que lo genera.
- No hagas commit ni push sin que te lo pidan.
