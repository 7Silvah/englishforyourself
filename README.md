# English for Yourself

App web para **aprender inglés desde el español**: tiempos verbales, gramática,
vocabulario por temas, *ways to say*, phrasal verbs, collocations, idioms y
hojas de ejercicios en PDF. La interfaz y las explicaciones están en español;
los ejemplos y el contenido que se aprende, en inglés.

> **Estado: en migración.** El sitio pasa de HTML/CSS/JS estático a
> **Vite + React + TypeScript + Tailwind + shadcn/ui**. El plan completo, con
> fases y checklist, está en [docs/PLAN.md](docs/PLAN.md). Mientras dura la
> migración, el sitio anterior vive en `legacy/` y se abre con doble clic en
> `legacy/index.html`.

## Qué incluye

La app se construye **por etapas**: cada una deja la app usable y añade
funciones. El detalle y el estado de cada etapa están en [docs/PLAN.md](docs/PLAN.md).

| Etapa | Qué gana el estudiante |
|---|---|
| 1 · Base + Fundamentos I | Curso guiado A1 (unidades 1–8: la oración, pronombres, *to be*, artículos, posesivos, *there is/are*, presente simple, preguntas) con ejercicios interactivos. Los 35 worksheets PDF se resuelven dentro de la app. |
| 2 · Fundamentos II + herramientas | Unidades A2 (9–16), dictado, traducción, arrastrar y soltar, Tense Lab, buscador y “Repasar mis errores”. |
| 3 · Vocabulario activo | Flashcards con repetición espaciada y ejercicios generados desde las listas de vocabulario. |
| 4 · Gramática intermedia | Unidades B1–B2 y prueba de nivel. |
| 5 · Calidad y publicación | Uso sin conexión (PWA), accesibilidad verificada y SEO. |

Las piezas principales son:
- **Curso de Fundamentos**: la estructura gramatical del inglés explicada en
  español, unidad por unidad, comparándola con el español, con los errores
  típicos de hispanohablantes y un repaso al final de cada unidad.
- **Ejercicios interactivos** de 12 tipos: completar, opción múltiple,
  verdadero/falso, ordenar palabras, transformar (afirmativa → negativa →
  pregunta), corregir errores, emparejar, categorizar, traducir, dictado,
  completar tablas y escuchar y elegir. La corrección es instantánea, acepta
  contracciones y avisa de las faltas de ortografía. Cada set tiene una
  versión imprimible.
- **Biblioteca**: 145 lecciones de consulta (tiempos verbales, gramática,
  vocabulario, phrasal verbs, collocations, idioms, *ways to say*).
- **Progreso** guardado en tu navegador, sin cuentas ni servidor.
- Colores coherentes en todo el sitio: verde = afirmativa, naranja = negativa,
  amarillo = pregunta.

## Requisitos

- [Node.js](https://nodejs.org) 24 LTS (incluye `npm`)
- Un editor con soporte de TypeScript (VS Code recomendado: al abrir el repo te sugerirá las extensiones de Prettier, oxc, Tailwind CSS IntelliSense y EditorConfig)

## Empezar

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila la app a `dist/` |
| `npm run preview` | Sirve `dist/` para probar el build |
| `npm run typecheck` | Revisa los tipos de TypeScript |
| `npm run lint` | Revisa el código con oxlint |
| `npm run format` | Formatea con Prettier |
| `npm run format:check` | Comprueba el formato sin cambiar archivos |
| `npm test` | Tests unitarios y de componentes (Vitest + Testing Library) |
| `npm run test:watch` | Lo mismo, repitiendo los tests al guardar |
| `npm run e2e` | Tests end-to-end (Playwright) |
| `npm run content:check` | Valida todo `src/content` (esquemas, MDX, enlaces, ejercicios) e informa de la traducción. Se ejecuta también en `npm run build` |
| `npm run migrate` | Regenera el contenido desde `legacy/` (lecciones, worksheets PDF y `public/_redirects`). Sobrescribe `src/content/lessons`, `wordlists` y `tables` |

## Stack

| | |
|---|---|
| Build | Vite |
| UI | React 19 + TypeScript (strict) |
| Estilos | Tailwind CSS v4 |
| Componentes | shadcn/ui (Base UI) + lucide-react |
| Rutas | TanStack Router (file-based) |
| Contenido | MDX + JSON validados con Zod |
| Estado | Zustand (persistido en `localStorage`) |
| Búsqueda | MiniSearch |
| Arrastrar y soltar | @dnd-kit |
| Audio | Web Speech API |
| Tests | Vitest, Testing Library, Playwright, axe |

## Estructura

```
src/
  routes/        rutas (un archivo = una URL)
  components/
    ui/          componentes de shadcn
    layout/      header, footer, breadcrumbs
    lesson/      piezas de una lección: GrammarTable, Formula, CommonMistake, SpeakButton…
  features/
    exercises/   motor de ejercicios: esquemas, corrección, player, tipos, generadores
    course/      mapa del curso y páginas de unidad
    progress/    progreso guardado (Zustand)
    search/ · tense-lab/ · flashcards/
  content/       contenido como datos
    course/units/        unidades del curso (.mdx)
    exercises/worksheets/ ejercicios migrados de los PDF (.json)
    exercises/original/   ejercicios nuevos por unidad (.json)
    lessons/             lecciones de la Biblioteca (.mdx)
    wordlists/           listas de vocabulario (.json)
    tables/              tablas gramaticales (.json)
    data/                tiempos verbales, verbos irregulares
  i18n/es.ts     todos los textos de la interfaz
  lib/           utilidades
scripts/         migración y validación de contenido
docs/PLAN.md     plan de implementación por etapas
```

## Añadir contenido

**Una lección en prosa** → crea `src/content/lessons/<sección>/<slug>.mdx` (la sección y el slug salen de la ruta):

```mdx
---
kind: article
title: Articles
titleEs: Artículos
summaryEs: Cuándo usar a, an y the.
level: A1
---

<Examples>

- I am a teacher.
- She is an engineer.

</Examples>

## A or An
...
```

**Una lista de vocabulario** → crea `src/content/wordlists/<sección>/<slug>.json`
con `kind: "wordlist"` y grupos de `{ en, es }`. Se convierte sola en flashcards
y ejercicios.

**Una unidad del curso** → crea `src/content/course/units/NN-<slug>.mdx` con el
frontmatter de [docs/PLAN.md](docs/PLAN.md) §6.3 (objetivos y sets de práctica,
worksheet y repaso). Dentro puedes usar `<Formula>`, `<Modes>`, `<Explain>`,
`<CommonMistake>`, `<Tip>` y `<FalseFriend>`.

**Un set de ejercicios** → crea `src/content/exercises/original/<unidad>/<id>.json` (el id es el nombre del archivo):

```json
{
  "titleEs": "Presente simple: completa la frase",
  "instructionEs": "Escribe el verbo en presente simple.",
  "source": "original",
  "level": "A1",
  "unit": "presente-simple",
  "topics": ["present-simple", "third-person"],
  "items": [
    {
      "id": "1",
      "type": "fill-blank",
      "text": "She ___ (to work) in a hospital.",
      "blanks": [{ "answers": ["works"] }],
      "explanationEs": "Con he/she/it el verbo lleva -s en presente simple."
    }
  ]
}
```

Los tipos de ejercicio y las reglas para escribirlos están en
[docs/PLAN.md](docs/PLAN.md) §7. Después ejecuta `npm run content:check`.

## Origen del contenido

El contenido educativo proviene de **englishforyourself.com** (fuera de línea
desde ~junio 2026), recuperado del archivo público de Wayback Machine y
reorganizado. Los worksheets PDF originales se convirtieron en ejercicios
interactivos. Este proyecto no está afiliado a los autores originales. Antes de
publicarlo, hay que confirmar los derechos de uso (ver “Riesgos” en
[docs/PLAN.md](docs/PLAN.md)). Las unidades del curso y los ejercicios nuevos
son contenido propio.
