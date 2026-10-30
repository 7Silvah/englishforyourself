# Plan de implementación — English for Yourself (Vite + React)

> Estado: **propuesta**. El trabajo se divide en **etapas** (qué gana el
> estudiante) y cada etapa en **fases** (qué se construye). Cada fase termina con
> un commit funcional: la app compila y se puede abrir. Marca las casillas a
> medida que avances y actualiza la tabla de estado.

## Estado

| Etapa | Fases | Estado |
|---|---|---|
| 1 · Base técnica + Fundamentos I (A1) | F0–F7 | 🟨 en curso — F0 ✅ F1 ✅ F2 ✅ F3 ✅ F4 ✅ F5 ✅ F6 ✅ F7 🟨 (CI lista; falta activar el despliegue) |
| 2 · Fundamentos II (A2) + herramientas | F8–F12 | ⬜ pendiente |
| 3 · Vocabulario activo | F13–F15 | ⬜ pendiente |
| 4 · Gramática intermedia (B1–B2) | F16–F17 | ⬜ pendiente |
| 5 · Calidad, offline y publicación | F18–F19 | ⬜ pendiente |
| Backlog · funcionalidades futuras | — | ideas sin fecha |

Leyenda: ⬜ pendiente · 🟨 en curso · ✅ terminada.

---

## 0. Resumen

Convertir el sitio estático actual (145 lecciones HTML y 35 worksheets en PDF) en
una aplicación **Vite + React + TypeScript + Tailwind + shadcn/ui** para
**aprender inglés desde el español**, con tres pilares:

1. **Curso de Fundamentos.** Una ruta guiada, unidad por unidad, que enseña la
   estructura gramatical básica del inglés con explicaciones en español y
   ejercicios para cada tema. Es lo **primero** que se construye.
2. **Ejercicios interactivos.** Todo lo que hoy está en PDF se puede resolver
   dentro de la app, con corrección instantánea y explicaciones. Además se
   crean **ejercicios nuevos de muchos tipos** (ordenar palabras, transformar,
   corregir errores, dictado, traducir…), no solo los que ya existían.
3. **Biblioteca.** Las 145 lecciones existentes como material de consulta,
   migradas a datos (MDX/JSON) y enlazadas desde el curso.

Las funciones se añaden **por etapas**: cada etapa deja la app usable y mejor
que la anterior, y lo que no entra en una etapa queda en el backlog (§13).

## 1. Etapas de desarrollo

Cada etapa tiene un **objetivo para el estudiante**, una lista de fases y un
**criterio de terminado** que se comprueba usando la app, no leyendo el código.

### Etapa 1 — Base técnica + Fundamentos I (A1)
**Objetivo:** un principiante puede estudiar la estructura básica del inglés
(unidades 1–8) y practicarla con ejercicios interactivos. Los 35 worksheets ya
no son PDF: se resuelven en la app.

| Fase | Qué se construye |
|---|---|
| F0 | Preparación del repo |
| F1 | Esqueleto Vite + React + TypeScript |
| F2 | Tailwind v4 + shadcn/ui + tema (colores pos/neg/q, modo oscuro) |
| F3 | Rutas y layout |
| F4 | Modelo de contenido + migración de lecciones **y de los 35 PDFs a ejercicios** |
| F5 | Motor de ejercicios (6 tipos básicos) + resultados guardados |
| F6 | Curso de Fundamentos I: unidades 1–8 con explicación y ejercicios originales |
| F7 | Despliegue privado de prueba + CI básica |

**Terminada cuando:**
- Se puede completar la unidad 1 y la 8 de principio a fin.
- Los 35 worksheets son interactivos.
- El progreso sobrevive a recargar la página.
- Hay una URL de prueba privada.

### Etapa 2 — Fundamentos II (A2) + herramientas
**Objetivo:** completar el nivel básico (unidades 9–16), con más formas de
practicar, repaso de errores y las herramientas del sitio antiguo (Tense Lab,
buscador). Al final, `legacy/` deja de hacer falta.

| Fase | Qué se construye |
|---|---|
| F8 | Curso de Fundamentos II: unidades 9–16 |
| F9 | 6 tipos de ejercicio más (dictado, traducción, categorizar, completar tabla, emparejar, escuchar y elegir) |
| F10 | Tense Lab en React + ejercicios generados desde los datos de los tiempos verbales |
| F11 | Buscador, pronunciación, traducciones desplegables; paridad con el sitio legacy y borrado de `legacy/` y de los PDF |
| F12 | Repaso inteligente: “Repasar mis errores”, examen de unidad y repaso mixto |

**Terminada cuando:**
- Las 16 unidades están disponibles y tienen al menos 6 tipos de ejercicio cada una.
- `legacy/` está eliminado.

### Etapa 3 — Vocabulario activo
**Objetivo:** aprender y retener vocabulario, no solo leer listas.

| Fase | Qué se construye |
|---|---|
| F13 | Flashcards con repetición espaciada (Leitner) desde cualquier lista |
| F14 | Ejercicios de vocabulario generados (opción múltiple, emparejar, escuchar y elegir) + traducciones A1–A2 + falsos amigos |
| F15 | Phrasal verbs, collocations y *ways to say* practicables (completar frase, elegir partícula) |

**Terminada cuando:** cualquier lista de vocabulario tiene botones de
“Flashcards” y “Practicar”, y las palabras repasadas aparecen en `/progreso`.

### Etapa 4 — Gramática intermedia (B1–B2)
**Objetivo:** continuar el curso con los temas intermedios y orientar a quien
llega con un nivel previo.

| Fase | Qué se construye |
|---|---|
| F16 | Unidades intermedias (tiempos perfectos y continuos, condicionales, voz pasiva, gerundio/infinitivo, tag questions, estilo indirecto, relativos, modales) |
| F17 | Prueba de nivel inicial que recomienda desde qué unidad empezar |

**Terminada cuando:**
- Todos los worksheets restantes están enlazados a una unidad.
- La prueba de nivel recomienda una unidad.

### Etapa 5 — Calidad, offline y publicación
| Fase | Qué se construye |
|---|---|
| F18 | Tests e2e + accesibilidad (axe) + presupuesto de rendimiento + PWA offline |
| F19 | SEO (prerender con TanStack Start), sitemap y publicación pública (**solo si se confirman los derechos del contenido**, ver §14) |

### Backlog (después de la etapa 5)
Ideas que se evalúan una a una cuando lleguen, ver §13.

---

## 2. Inventario del sitio actual

| Elemento | Cantidad / ubicación | Destino en la app nueva |
|---|---|---|
| Lecciones HTML | 161 páginas; **145 lecciones** (el resto son índices de sección, páginas legales y la portada) | Biblioteca: 55 MDX (`article`) + 90 JSON (`wordlist`) |
| Secciones | 8: verb-tenses, vocabulary, ways-to-say, phrasal-verbs, collocations, idioms, grammar, worksheets | `src/content/sections.ts` (7; *worksheets* pasa a `/ejercicios`) |
| Tablas | 56 `gtable` + tablas simples: 82 en total | `src/content/tables/**.json` + `<GrammarTable>` |
| **Worksheets PDF** | 35 en `assets/pdf/`, **todos con el mismo formato**: instrucción, 10 frases con hueco `__________`, pista entre paréntesis y *Answer key* | **350 ejercicios interactivos** en `src/content/exercises/worksheets/` + versión imprimible generada |
| Tense Lab | `assets/js/tense-lab.js` (datos embebidos) | `src/content/data/tenses.ts` + `features/tense-lab/` |
| Buscador | `assets/js/search-data.js` | MiniSearch sobre el manifiesto |
| Páginas legales / about | `legal/`, `about.html` | `/acerca` (texto propio). Las legales **no se migran**: son del sitio original; textos propios antes de publicar (F19) |
| Colores pos/neg/q | `style.css` | tokens de Tailwind |

Detalles de los PDF que afectan a la migración:
- Los nombres de archivo dicen “Continous” (con errata); los ids nuevos usan
  `continuous`.
- Algunos caracteres salen corruptos al extraer el texto (`�` en lugar de
  guiones y comillas), así que hay que revisarlos a mano.
- La clave de respuestas solo da una forma. Hay que añadir las variantes
  válidas: *travelled/traveled*, contracciones (*didn't / did not*).

El generador original (`../efy-build/build.py`) no está en el repo: la
migración parte del HTML y los PDF versionados aquí.

## 3. Principios

1. **Hispanohablante primero.** UI, explicaciones, pistas y retroalimentación
   en español. El inglés es el contenido que se aprende.
2. **Estructura antes que vocabulario.** El curso empieza por cómo se
   construye una frase en inglés (sujeto obligatorio, orden S-V-O, auxiliares)
   y compara cada tema con el español.
3. **Aprender haciendo.** Cada explicación va seguida de ejercicios. Ninguna
   unidad se publica sin práctica.
4. **Variedad de ejercicios.** El mismo tema se practica de varias formas
   (reconocer → ordenar → producir → corregir → escuchar).
5. **El contenido son datos.** Lecciones, unidades y ejercicios son MDX/JSON
   validados con Zod. Los componentes solo los presentan.
6. **Estático y sin backend.** El progreso se guarda en el navegador.
7. **Simple antes que ingenioso**, y **accesible por defecto** (teclado,
   contraste AA, `lang="en"` en el inglés).

## 4. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Build | **Vite 8** | Arranque instantáneo y HMR. |
| UI | **React 19** + **TypeScript 7** strict | Tipos para contenido, ejercicios y componentes. TS 7 es el compilador nativo y es mucho más rápido. |
| Estilos | **Tailwind CSS v4** (`@tailwindcss/vite`) | Tokens en CSS (`@theme`). |
| Componentes | **shadcn/ui** (Base UI, preset Nova) + **lucide-react** | Componentes accesibles y legibles dentro del repo. |
| Rutas | **TanStack Router** (file-based) | Parámetros tipados; migración sencilla a TanStack Start para el prerender. |
| Contenido | **MDX** (`@mdx-js/rollup`) + **Zod** | Prosa con componentes; esquemas que fallan en el build. |
| Arrastrar y soltar | **@dnd-kit** (F9) | Ordenar palabras y categorizar, accesible con teclado. |
| Estado | **Zustand** + `persist` | Progreso y resultados en `localStorage`. |
| Búsqueda | **MiniSearch** | Búsqueda difusa en el cliente, sin acentos. |
| Audio | **Web Speech API** | Pronunciación y dictado sin archivos de audio. |
| PDF → texto | **unpdf** (solo en el script de migración) | Extrae el texto sin depender de herramientas del sistema. |
| Calidad | **oxlint** + Prettier + **Vitest** + Testing Library + **Playwright** + axe | oxlint viene en la plantilla de Vite: es mucho más rápido que ESLint y no necesita configuración. |
| Offline | **vite-plugin-pwa** (F18) | |
| Runtime | Node 24 LTS, **npm** | |

Descartado a propósito: Next.js, Redux, CSS-in-JS y librerías de i18n
completas por ahora (ver §9.1).

## 5. Estructura de carpetas

```
englishforyourself/
├─ public/favicon.svg
├─ scripts/
│  ├─ migrate/               ← lecciones HTML → MDX/JSON, PDFs → ejercicios (se archiva al acabar)
│  └─ content-check.ts       ← valida contenido, ejercicios, enlaces y traducciones
├─ src/
│  ├─ main.tsx · index.css
│  ├─ routes/                ← rutas file-based (ver §8)
│  ├─ components/
│  │  ├─ ui/                 ← shadcn
│  │  ├─ layout/             ← SiteHeader, SiteFooter, Breadcrumbs, ThemeToggle
│  │  └─ lesson/             ← GrammarTable, WordList, Explain, Examples, Tip,
│  │                           CommonMistake, FalseFriend, SpeakButton, Formula, LessonNav
│  ├─ features/
│  │  ├─ exercises/          ← motor de ejercicios
│  │  │  ├─ schema.ts        ← tipos de ejercicio (unión discriminada de Zod)
│  │  │  ├─ check.ts         ← corrección de respuestas (con tests)
│  │  │  ├─ player/          ← ExercisePlayer, ResultScreen, PrintView
│  │  │  ├─ types/           ← un componente por tipo: fill-blank.tsx, word-order.tsx…
│  │  │  └─ generators/      ← ejercicios generados desde datos (tenses, wordlists)
│  │  ├─ course/             ← mapa del curso, página de unidad, desbloqueo recomendado
│  │  ├─ progress/           ← store de Zustand (resultados, errores, racha)
│  │  ├─ search/ · tense-lab/ · flashcards/
│  ├─ content/
│  │  ├─ schema.ts · sections.ts · index.ts (manifiesto)
│  │  ├─ course/units/<nn>-<slug>.mdx       ← unidades del curso
│  │  ├─ exercises/worksheets/<slug>.json   ← migrados de los PDF
│  │  ├─ exercises/original/<unit>/<slug>.json ← creados nuevos
│  │  ├─ lessons/<sección>/<slug>.mdx       ← biblioteca
│  │  ├─ wordlists/<sección>/<slug>.json
│  │  ├─ tables/<id>.json
│  │  ├─ data/tenses.ts
│  │  ├─ sections.ts         ← secciones de la Biblioteca
│  ├─ i18n/es.ts             ← textos de UI
│  ├─ lib/                   ← cn(), speech, normalize, random con semilla
│  └─ test/
├─ e2e/
├─ legacy/                   ← sitio antiguo (se borra en F11)
├─ docs/PLAN.md · CLAUDE.md · README.md
```

Regla: `components/` = presentación · `features/` = lógica y estado ·
`content/` = datos · `routes/` = archivos delgados.

---

## 6. Curso de Fundamentos (prioridad de la etapa 1)

### 6.1 Temario

El orden va de cómo se arma una frase a los tiempos verbales básicos. Cada
unidad indica qué contraste con el español se trabaja y qué worksheet migrado
la acompaña.

**Fundamentos I — A1 (etapa 1, F6)**

| # | Unidad | Contenido clave | Contraste con el español | Worksheet |
|---|---|---|---|---|
| 1 | La oración en inglés | Sujeto + verbo + complemento; el sujeto es obligatorio (*It is raining*); el adjetivo va antes del sustantivo | En español el sujeto se omite (*Llueve*) y el adjetivo suele ir detrás | — |
| 2 | Pronombres personales | Sujeto (*I, you, he…*) y objeto (*me, you, him…*); *it*; *you* singular/plural | No hay *tú/usted*; *it* para cosas y animales | — |
| 3 | Verbo *to be* | *am/is/are*: afirmativa, negativa, pregunta, contracciones; usos | *I am 20 years old* (no *have*); *I am hungry* (no *have hunger*); ser y estar son el mismo verbo | Verb To Be |
| 4 | Artículos y plurales | *a/an/the*, cuándo no hay artículo; plurales regulares e irregulares | *I am a teacher* (con artículo); los adjetivos no tienen plural | Articles |
| 5 | Posesivos y demostrativos | *my/your/his…*, *'s*, *this/that/these/those* | *his/her* depende del poseedor (*su* no distingue) | — |
| 6 | *There is / there are* | Contables e incontables, *some/any*, *how much/how many* | *hay* es una sola forma; en inglés cambia con el número | — |
| 7 | Presente simple | *-s* en 3ª persona, *do/does*, *don't/doesn't*, adverbios de frecuencia | El auxiliar *do* no existe en español; *She work* ✗ | Present Simple (+ negativa) |
| 8 | Hacer preguntas | Orden auxiliar + sujeto + verbo; *wh-words*; respuestas cortas (*Yes, I do*) | En español basta la entonación; en inglés hace falta el auxiliar | — |

**Fundamentos II — A2 (etapa 2, F8)**

| # | Unidad | Contenido clave | Contraste con el español | Worksheet |
|---|---|---|---|---|
| 9 | Presente continuo | *am/is/are + -ing*; ortografía del *-ing*; continuo vs. simple | Los verbos de estado no van en continuo (*I am knowing* ✗) | Present Continuous (+ negativa) |
| 10 | Imperativo y *can* | Órdenes, *let's*, *can/can't* (habilidad y permiso) | *can* no lleva *to* ni *-s* | — |
| 11 | Preposiciones *in/on/at* | Lugar y tiempo | *en* = *in/on/at* según el caso | — |
| 12 | Pasado de *to be* | *was/were* | — | — |
| 13 | Pasado simple | Regulares (*-ed* y su pronunciación), irregulares, *did/didn't* | *I didn't went* ✗ | Simple Past (+ negativa) |
| 14 | Futuro | *will* vs. *going to* | *going to* para planes; *will* para decisiones en el momento | Future Simple, Going To, Future Negative |
| 15 | Comparativos y superlativos | *-er/-est*, *more/most*, irregulares | *more big* ✗ | Comparative & Superlative |
| 16 | Unir ideas | *and, but, or, because, so*; orden de los adverbios | — | — |

**Intermedio — B1–B2 (etapa 4, F16)**, con los worksheets restantes:
- Present perfect (+ continuo) y su contraste con el past simple.
- Past continuous.
- Past perfect (+ continuo).
- Future continuous y future perfect (+ continuo).
- Condicionales 0, 1, 2 y 3.
- Voz pasiva.
- Gerundio e infinitivo.
- Tag questions.
- Estilo indirecto.
- Oraciones de relativo.
- Modales de obligación y consejo.
- Deseos y arrepentimientos.

### 6.2 Anatomía de una unidad

Todas las unidades siguen la misma plantilla, que hace de checklist para
escribirlas:

1. **Objetivos** (“Al terminar esta unidad sabrás…”), de 2 a 4 puntos.
2. **Explicación corta en español** con la **fórmula** en bloques de colores
   (sujeto / auxiliar / verbo / complemento) y una tabla pos/neg/q.
3. **Comparación con el español**.
4. **Errores comunes** de hispanohablantes (`<CommonMistake>`).
5. **Práctica guiada**: ejercicios de reconocer, con pistas (opción múltiple,
   verdadero/falso, ordenar palabras).
6. **Práctica libre**: ejercicios de producir (completar, transformar,
   corregir errores, traducir).
7. **Worksheet original** migrado, si hay.
8. **Repaso de la unidad**: 10–15 preguntas mezcladas. Con **≥ 80 %** la unidad
   queda como *dominada*.
9. Enlaces a la Biblioteca para profundizar.

Volumen orientativo por unidad: **40–60 ítems** repartidos en 5–8 sets y en
**al menos 4 tipos de ejercicio distintos**. Esto es la meta final: hasta
resolver la decisión pendiente **D1** (§14), cada unidad lleva solo sets de
muestra.

El curso **no bloquea** unidades. Muestra la siguiente recomendada y marca
las dominadas. Bloquear frustra a quien ya sabe algo; la prueba de nivel (F17)
resuelve ese caso.

### 6.3 Esquema de una unidad

Archivo `src/content/course/units/03-verbo-to-be.mdx`. El slug de la URL
(`/curso/verbo-to-be`) sale del nombre del archivo y `number` debe coincidir con
el prefijo `NN`. Esquema en `content/schema.ts` (`UnitMeta`).

```mdx
---
number: 3
block: fundamentos-1          # fundamentos-1 | fundamentos-2 | intermedio
title: The Verb To Be
titleEs: El verbo to be (ser y estar)
summaryEs: Am, is y are en afirmativa, negativa y pregunta…   # para el mapa del curso
level: A1
objectivesEs:                 # 2–4; entre comillas si llevan ": "
  - Usar am, is y are con cada pronombre.
  - Hacer frases negativas y preguntas con to be.
  - Decir tu edad, cómo estás y de dónde eres.
guided: [verbo-to-be-guiada]  # práctica guiada (reconocer)
free: [verbo-to-be-libre]     # práctica libre (producir)
worksheets: [verb-to-be]      # worksheets migrados
review: verbo-to-be-repaso    # repaso: con ≥ 80 % la unidad queda dominada
library: [grammar/verbs]
---
```

Los sets propios viven en `exercises/original/<slug>/` y llevan `"unit": "<slug>"`;
`content:check` comprueba que la unidad y el set se apuntan mutuamente y que un
set solo pertenece a una unidad. El estado de la unidad (sin empezar, empezada,
completada, dominada) **no se guarda**: se calcula de las notas de sus sets
(`features/course/logic.ts`).

---

## 7. Motor de ejercicios

### 7.1 Tipos de ejercicio

| Tipo (`type`) | Cómo se ve | Practica | Fase |
|---|---|---|---|
| `fill-blank` | Frase con hueco(s) y pista: *I ___ (to travel) last year.* | Producir la forma correcta | F5 |
| `multiple-choice` | Elegir 1 de 3–4 opciones | Reconocer | F5 |
| `true-false` | ¿La frase es correcta? Sí/No + explicación | Detectar errores | F5 |
| `word-order` | Fichas desordenadas que se tocan o arrastran para formar la frase | Estructura y orden de la oración | F5 |
| `transform` | “Pásala a negativa / pregunta / pasado”: *She works here.* → ___ | Dominar pos/neg/q | F5 |
| `error-correction` | Tocar la palabra incorrecta y escribir la correcta | Errores típicos | F5 |
| `match` | Emparejar dos columnas (pronombre ↔ *to be*, EN ↔ ES) | Asociación | F9 |
| `categorize` | Arrastrar palabras a grupos (contable/incontable, *a/an*, *-s/-es/-ies*) | Clasificar reglas | F9 |
| `translate` | Traducir ES → EN con banco de palabras o escribiendo | Transferencia desde el español | F9 |
| `dictation` | Escuchar la frase (TTS) y escribirla | Comprensión auditiva y ortografía | F9 |
| `table-fill` | Completar celdas de una tabla pos/neg/q | Visión global de un tiempo verbal | F9 |
| `listen-choose` | Escuchar y elegir la frase o palabra correcta | Discriminar sonidos | F9 |

Cada tipo es un componente en `features/exercises/types/` que recibe el ítem y
devuelve la respuesta. La corrección es común a todos (`check.ts`). Todos
funcionan con teclado: Enter comprueba y pasa al siguiente, y las fichas se
seleccionan con Tab y Espacio.

### 7.2 Esquema (`features/exercises/schema.ts`)

```ts
const Base = z.object({
  id: z.string(),
  explanationEs: z.string().optional(),   // se muestra al corregir
  hintEs: z.string().optional(),          // botón "Pista"
  audio: z.boolean().default(false),      // muestra botón 🔊 con la frase correcta
});

const FillBlank = Base.extend({
  type: z.literal("fill-blank"),
  text: z.string(),                        // "I ___ (to travel) to South Korea last year."
  blanks: z.array(z.object({ answers: z.array(z.string()).min(1) })),
});

const MultipleChoice = Base.extend({
  type: z.literal("multiple-choice"),
  prompt: z.string(), options: z.array(z.string()).min(2), answer: z.number(),
});

const WordOrder = Base.extend({
  type: z.literal("word-order"),
  answers: z.array(z.string()).min(1),     // frases válidas completas
  distractors: z.array(z.string()).default([]),
});

const Transform = Base.extend({
  type: z.literal("transform"),
  source: z.string(), to: z.enum(["neg", "q", "nq", "pos", "past", "future", "passive"]),
  answers: z.array(z.string()).min(1),
});

// …TrueFalse, ErrorCorrection, Match, Categorize, Translate, Dictation, TableFill, ListenChoose

export const ExerciseItem = z.discriminatedUnion("type", [FillBlank, MultipleChoice, WordOrder, Transform /* … */]);

export const ExerciseSet = z.object({
  id: z.string(),                          // "simple-past-tense-worksheet" | "u03-order"
  title: z.string(), titleEs: z.string(),
  instruction: z.string().optional(),      // instrucción original en inglés
  instructionEs: z.string(),
  source: z.enum(["worksheet", "original", "generated"]),
  level: Level, unit: z.string().optional(), lessons: z.array(z.string()).default([]),
  topics: z.array(z.string()),             // "past-simple", "negative", "irregular-verbs"
  items: z.array(ExerciseItem).min(1),
});
```

### 7.3 Corrección (`check.ts`)

Va con tests unitarios exhaustivos, porque es la parte que más afecta a la
experiencia:

- **Normalización:**
  - Recorta espacios y colapsa los dobles.
  - Convierte comillas tipográficas en rectas (`’` → `'`).
  - Ignora mayúsculas y el punto final.
  - Las mayúsculas cuentan en la primera palabra solo si `caseSensitive`.
- **Contracciones equivalentes** automáticas cuando no son ambiguas: *don't =
  do not*, *won't = will not*, *can't = cannot = can not*, *I'm = I am*, *'re,
  've, 'll*. Las ambiguas (*'s* = is/has, *'d* = would/had) solo valen si
  están en `answers`.
- **Variantes UK/US** (*travelled/traveled*, *organise/organize*): se añaden en
  `answers`. `content:check` avisa de palabras conocidas con variantes.
- **“Casi”**: si la respuesta está a distancia 1 de una válida (Levenshtein
  contando el intercambio de dos letras, *recieve*), se muestra “Revisa la
  ortografía” y se permite reintentar **una vez** sin contar el fallo (solo en
  práctica; en examen cuenta como fallo). No se aplica a respuestas de menos de
  5 letras (*a/an*) ni a cambios **al final de una palabra** (*work/works*,
  *play/played*): eso son errores de gramática, justo lo que se practica.
  También detecta el apóstrofo olvidado (*dont*). *Pendiente (backlog):
  explicación específica si coincide con la respuesta de otro hueco o con un
  error típico declarado.*
- Resultado: `{ status: "correct" | "almost" | "wrong", parts? }`; `parts` da el
  estado de cada hueco (fill-blank) o paso (error-correction). La solución que
  se muestra la calcula `solution.ts`.

### 7.4 Experiencia de juego (`ExercisePlayer`)

- Un ítem por pantalla en móvil; modo lista opcional en escritorio, como el
  worksheet original.
- Barra de progreso, “Pista”, “Comprobar”, “Siguiente” y botón 🔊 en la frase
  correcta.
- Al corregir: color de estado (siempre con icono ✓/✗ y texto), la respuesta
  correcta y la explicación en español.
- Dos modos: **práctica** (corrección inmediata y reintento) y **examen**
  (corrección al final; se usa en los repasos de unidad).
- Pantalla de resultado: puntuación, lista de fallos con explicación,
  “Repetir solo los fallados” y “Siguiente set”.
- **Versión imprimible** (`/ejercicios/$id/imprimir`): hoja con estilos de
  impresión y la clave de respuestas al final. Sustituye a los PDF.
- Fichas (`word-order`) y opciones (`multiple-choice`) barajadas con semilla
  (`src/lib/random.ts`, reproducible en tests); las fichas nunca salen ya
  ordenadas. **Los ítems mantienen su orden** (el del worksheet y el de la hoja
  impresa).

### 7.5 Ejercicios generados (F10, F14)

Funciones puras en `generators/` que crean sets nuevos cada vez a partir de
los datos:
- **Tiempos verbales** (`tenses.ts`): transformar pos→neg→q, elegir el auxiliar,
  ordenar bloques y completar la tabla.
- **Wordlists**: opción múltiple EN↔ES, emparejar, escuchar y elegir, dictado.
- **Lista de verbos irregulares** (dato nuevo `irregular-verbs.ts`): completar
  la forma de pasado o participio.

Se marcan con `source: "generated"` y no ocupan archivos JSON.

### 7.6 Progreso de ejercicios

En `features/progress/store.ts` (Zustand + `persist`, clave `efy-progress`, con
`version` + `migrate`):
- `attempts[setId]`: mejor puntuación, último intento y número de intentos.
- `mistakes[itemKey]`: ítems fallados con fecha. Alimentan **“Repasar mis
  errores”** (F12): el ítem sale de la lista tras acertarlo 2 veces en días
  distintos.
- `units[unitId]`: `started | completed | mastered` (repaso ≥ 80 %).
- Racha diaria y última actividad (para “Continúa donde lo dejaste”).

### 7.7 Reglas para escribir ejercicios nuevos

- Inglés natural y frecuente; nada de frases artificiales para forzar la regla.
- **Una sola respuesta razonable**, o todas las válidas listadas en `answers`.
- `explanationEs` obligatoria en los ejercicios `original`: por qué es así,
  no solo cuál es la respuesta.
- Los distractores de opción múltiple son **errores reales de
  hispanohablantes**, no opciones absurdas.
- Variedad de sujetos, tiempos y vocabulario de nivel A1–A2 en las unidades
  1–16.
- Quién escribe y revisa los ejercicios originales está **pendiente (D1,
  §14)**. El campo `reviewed` existe en el esquema desde el principio para no
  tener que migrar después, y `content:check` informa de los sets no
  revisados.

---

## 8. Rutas

| URL | Contenido |
|---|---|
| `/` | Portada: “Empieza aquí” (curso), “Continúa donde lo dejaste”, buscador, accesos a Ejercicios y Biblioteca |
| `/curso` | Mapa del curso por bloques, con el estado de cada unidad |
| `/curso/$unidad` | Unidad: explicación + lista de sets + repaso |
| `/ejercicios` | Catálogo: filtros por tema, nivel, tipo y origen (worksheet / nuevos) |
| `/ejercicios/$id` | Jugar un set |
| `/ejercicios/$id/imprimir` | Versión imprimible con la clave |
| `/repaso` | Repasar mis errores y repaso mixto (F12) |
| `/biblioteca` | Las 7 secciones de la Biblioteca (la de *worksheets* pasa a `/ejercicios`) |
| `/biblioteca/$section` · `/biblioteca/$section/$` | Sección y lección de la Biblioteca (slugs actuales, splat para subcarpetas) |
| `/herramientas/tense-lab?tense=` | Tense Lab (F10) |
| `/practicar/flashcards?lista=` | Flashcards (F13) |
| `/progreso` | Resumen de progreso |
| `/buscar?q=` | Resultados de búsqueda (F11) |
| `/acerca` · `/legal/$slug` | Informativas |
| `/dev/ui` | Sistema de diseño (solo en desarrollo) |

- La Biblioteca vive bajo `/biblioteca/` (decidido en F3) para que los
  breadcrumbs salgan de la URL y ninguna sección pueda chocar con `/curso`,
  `/ejercicios`, etc.
- Breadcrumbs: cada ruta que aporta una miga devuelve `{ crumb }` en su
  `loader`, y las carpetas con `route.tsx` aportan la miga de su nivel.
- URLs viejas (`/lessons/…/x.html`, `/assets/pdf/X.pdf`) → `public/_redirects`
  hacia la lección o el set de ejercicios equivalente.

## 9. Diseño y experiencia para hispanohablantes

### 9.1 Idioma
- Textos de UI en `src/i18n/es.ts`, tipado. Ningún texto suelto en JSX.
- Español neutro y con tuteo. `<html lang="es">`; todo el inglés con `lang="en"`.
- Otro idioma de origen → se crea `pt.ts` con el mismo tipo y entonces se adopta
  una librería de i18n.

### 9.2 Identidad visual
- Tokens actuales: primario `#2563eb`, acento `#7c3aed` y los colores de modo
  gramatical **pos (verde) / neg (naranja) / q (amarillo) / nq**, iguales en
  tablas, Tense Lab, ejercicios `transform` y leyendas.
- Bloques de estructura: **sujeto azul, auxiliar ámbar, verbo verde,
  complemento gris**. Se usan en las fórmulas de las unidades, en `word-order`
  y en el Tense Lab, para que el estudiante relacione la explicación con la
  práctica.
- Estados de corrección: correcto, casi y fallo, siempre con icono y texto.
- Modo oscuro con su propia paleta (contraste AA). Fuente Geist Variable (la del preset Nova).

### 9.3 Funciones pensadas para hispanohablantes
- Explicaciones en español con equivalencias y diferencias respecto al español.
- `<CommonMistake>`, `<FalseFriend>`, glosario de términos gramaticales EN ⇄ ES.
- Pronunciación con TTS (voz en-US o en-GB) y notas sobre sonidos difíciles:
  /v/ vs /b/, /ʃ/, vocales largas y cortas, *-ed* final, *s* inicial (*eschool* ✗).
- Distractores y retroalimentación basados en errores típicos del español.
- Búsqueda en los dos idiomas.

---

## 10. Migración

Script `npm run migrate` (Node + `tsx`), idempotente, que lee `legacy/` y
escribe en `src/content/`. El resultado se revisa con `git diff` y el contenido
generado va en un commit propio.

### 10.1 Lecciones (Biblioteca)
1. `cheerio`: título, sección y HTML de `.lesson-content`.
2. `gtable` → `src/content/tables/*.json` (`g-pos/g-neg/g-q/g-nq` → `tone`,
   `.formula` → `formula: true`); en el cuerpo, `<GrammarTable id="…" />`.
3. Patrón “`h2` + palabras separadas por `<br>`” → `wordlist` JSON; si no,
   `article` MDX (`rehype-parse → rehype-remark → remark-stringify`), sin
   clases de WordPress.
4. Enlaces internos `../../lessons/x/y.html` → `/x/y`.
5. Tense Lab: `TENSES` → `src/content/data/tenses.ts` tipado.

### 10.2 Worksheets PDF → ejercicios interactivos
1. Extraer el texto de cada PDF con `unpdf`.
2. Parsear:
   - La línea `Instruction:` → `instruction`.
   - Las líneas numeradas hasta `Answer key` → ítems, uniendo las líneas
     partidas.
   - Lo que hay después de `Answer key` → respuestas por número.
3. Convertir cada ítem en `fill-blank`:
   - `__________` → `___`.
   - El texto entre paréntesis queda en la frase como pista visible.
   - Respuestas con `/` → varias en `answers`.
4. Arreglar la codificación (`�` → `–` o `'`) y la errata *Continous* →
   *continuous* en el id.
5. Añadir `instructionEs`, `titleEs`, `level`, `topics` y las lecciones
   relacionadas desde una **tabla de mapeo** manual (`scripts/migrate/worksheet-map.ts`:
   archivo → unidad y lecciones).
6. Escribir `src/content/exercises/worksheets/<id>.json` con `source:
   "worksheet"`.
7. Informe: 35 sets y 350 ítems, con los que no tienen respuesta o tienen
   caracteres raros.
8. **Revisión manual** de los 350 ítems: añadir variantes UK/US y
   contracciones, comprobar la clave de respuestas y escribir
   `explanationEs` cuando aporte.
9. Las páginas de la Biblioteca que enlazaban a un PDF pasan a enlazar al set
   interactivo.
10. Los PDF se borran en F11, cuando la versión imprimible esté validada.

### 10.3 Redirecciones
Generar `public/_redirects` con todas las URLs viejas (lecciones y PDF).

---

## 11. Fases en detalle

Cada fase indica qué conceptos vas a aprender en ella.

### Etapa 1 — Base técnica + Fundamentos I

#### F0 — Preparación
*Aprendes: organización de un repo y `git mv`.*
- [x] Rama `migracion-react`.
- [x] `git mv` del sitio a `legacy/` (`index.html`, `about.html`, `assets/`, `lessons/`, `legal/`).
- [x] Node 24 LTS; `.gitignore` (`node_modules`, `dist`, `.vite`, `coverage`, `playwright-report`), `.editorconfig`.
- [x] `.gitattributes` con `eol=lf`: en Windows `core.autocrlf=true` convierte a CRLF y Prettier espera LF.

**Listo cuando:** `legacy/index.html` abre igual que antes.

#### F1 — Esqueleto Vite + React + TS
*Aprendes: Vite, componentes, JSX, TypeScript strict, alias `@/`.*
- [x] Plantilla `react-ts` de create-vite 9 (Vite 8, React 19.3, TypeScript 7), generada aparte y copiada sin la demo.
- [x] `tsconfig`: `strict`, `noUncheckedIndexedAccess`, alias `@/*` → `./src/*` (en `tsconfig.json` y `tsconfig.app.json`). Sin `baseUrl`, que TypeScript 7 ya no usa; `paths` es relativo al tsconfig.
- [x] Alias en `vite.config.ts` con `fileURLToPath(new URL("./src", import.meta.url))` (forma ESM; `__dirname` no existe en ESM).
- [x] **oxlint** (el linter que trae ahora la plantilla, en lugar de ESLint) con `rules-of-hooks` y `exhaustive-deps`; ignora `legacy/`. Prettier con `.prettierignore`. `prettier-plugin-tailwindcss` pasa a F2, cuando ya esté Tailwind.
- [x] Scripts `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `format:check`.
- [x] `.vscode/` con extensiones recomendadas y formato al guardar; `index.html` en español; favicon EfY.

**Listo cuando:** `npm run dev` y `npm run build` funcionan.

#### F2 — Tailwind v4 + shadcn/ui + tema
*Aprendes: utility-first CSS, tokens de diseño, shadcn.*
- [x] Tailwind 4.3 (`tailwindcss` + `@tailwindcss/vite`, en `devDependencies`); plugins `react()`, `tailwindcss()`.
- [x] `npx shadcn@latest init -t vite -b base -p nova`: **Base UI** (el valor por defecto de shadcn desde julio de 2026, en lugar de Radix; se usa `render={<Button/>}` en vez de `asChild`), preset *Nova* (iconos Lucide, fuente Geist).
- [x] Componentes: `button card badge tabs table tooltip dialog sheet command separator scroll-area switch progress sonner breadcrumb navigation-menu radio-group input toggle-group dropdown-menu` (+ dependencias que trae shadcn: `textarea toggle input-group`).
- [x] Textos para lectores de pantalla de `components/ui` traducidos (Cerrar, Más, Ruta de navegación, Buscar); import sin uso en `scroll-area` eliminado.
- [x] Primario = azul de la marca (`#2563eb`) y `brand` = violeta. Tokens `@theme`: `pos/neg/q/nq` (`-ink`, `-soft`) con los colores del sitio original, bloques `subj/aux/verb/obj` (`-border`, `-fg`) con los del Tense Lab y estados `correct/almost/wrong`; todos con versión `.dark`.
- [x] `ThemeProvider` propio (`components/layout/theme-provider.tsx` + `hooks/use-theme.ts`), en lugar de `next-themes`, cuyo script inline provoca un aviso de React en apps sin servidor. Script en `index.html` contra el destello blanco y `ThemeToggle` (Claro / Oscuro / Sistema).
- [x] `/dev/ui` (`src/dev/ui-showcase.tsx`; en F2 era `/_dev/ui`, pero en TanStack Router un `_` inicial significa ruta sin URL), solo en desarrollo y fuera del build. `prettier-plugin-tailwindcss` ordena las clases.

**Nota de tamaño:** la base (React + Base UI + sonner) ocupa unos 139 KB gzip de JS. Hay que vigilarla frente al presupuesto de 200 KB (F18); las rutas de F3 se cargarán por separado.

**Listo cuando:** la página de muestra se ve bien en claro y en oscuro.

#### F3 — Rutas y layout
*Aprendes: enrutado file-based, layouts, parámetros tipados, code splitting.*
- [x] `@tanstack/react-router` 1.170; `@tanstack/router-plugin` y `@tanstack/react-router-devtools` (cargadas solo en desarrollo) en `devDependencies`.
- [x] `tanstackRouter({ target: "react", autoCodeSplitting: true })` **antes** de `react()`; `src/routeTree.gen.ts` generado y versionado (sin él `tsc -b` falla en un clon nuevo), excluido de Prettier y oxlint.
- [x] `__root.tsx`: enlace “Saltar al contenido”, `SiteHeader` (Curso · Ejercicios · Biblioteca · Progreso, enlace activo resaltado; `Sheet` en móvil que se cierra al navegar), `Breadcrumbs`, `<main id="contenido">`, `SiteFooter` y `HeadContent` (títulos de pestaña por ruta).
- [x] `src/i18n/es.ts` con navegación, portada, páginas y 404.
- [x] Rutas: `/`, `/curso`, `/curso/$unidad`, `/ejercicios`, `/ejercicios/$id`, `/biblioteca`, `/biblioteca/$section` (valida la sección; si no existe → 404), `/biblioteca/$section/$`, `/progreso`, `/acerca`, `/dev/ui`, además de la 404 global.
- [x] Adelantado de F4: `src/content/sections.ts` (7 secciones con nombre y descripción en español), necesario para la Biblioteca y la 404 de secciones.
- [x] Portada real (hero + tres pilares) y Biblioteca con tarjetas por sección; el resto con el marcador `ComingSoon` que indica la fase.
- [x] oxlint: `only-export-components` desactivada en `src/routes/` (el code splitting del plugin se ocupa del fast refresh).
- [x] Probado en el navegador: navegación, breadcrumbs con subcarpetas, 404, títulos y móvil a 390 px (sin scroll horizontal, menú lateral).

**Listo cuando:** se navega entre páginas vacías.

#### F4 — Contenido + migración
*Aprendes: MDX, `import.meta.glob`, Zod, scripts Node.*
- [x] MDX con `@mdx-js/rollup` (`remark-frontmatter`, `remark-gfm`, `rehype-slug`), sin `@mdx-js/react`: los componentes se pasan con `<Content components={mdxComponents} />`.
- [x] **Plugin `content-meta`** (`scripts/vite-plugin-content-meta.ts`): `x.mdx?meta` / `x.json?meta` devuelve solo los metadatos. El índice de la Biblioteca y el catálogo cargan los metadatos al inicio y el cuerpo de cada lección o set va en su propio archivo (unos 200). Si se importara el mismo archivo de las dos formas, Vite lo metería entero en el paquete principal.
- [x] `content/schema.ts` y `features/exercises/schema.ts` (los 12 tipos de §7.1). **La sección y el slug salen de la ruta del archivo**, no del frontmatter. Los campos opcionales no tienen valor por defecto (el código usa `?? []`) y los objetos son estrictos (una clave mal escrita da error).
- [x] **Validación al compilar, no en el navegador:** Zod solo se usa en `content:check` y en la migración. La app importa los tipos y confía en el contenido (`trusted()` en `content/index.ts`). Así se ahorran unos 27 KB gzip de Zod en la carga inicial. `npm run build` ejecuta `content:check` primero.
- [x] `content/index.ts`: manifiesto con `getLesson`, `getSectionLessons`, `getChildLessons` (lecciones hijas por carpeta), `getPrevNext`, `getExerciseSet`, `getExerciseSetsForLesson`. `getUnit` llega en F6.
- [x] Migración de los PDF (§10.2), `npm run migrate:worksheets`: 35 sets y 350 ítems `fill-blank`, revisados uno a uno. Se corrigieron 4 erratas del original (se listan al migrar) y se añadieron las contracciones ambiguas (’d, ’s) y las variantes UK/US.
- [x] Migración de lecciones (§10.1), `npm run migrate:lessons`: **145 lecciones** (las 161 páginas incluían índices de sección, páginas legales y la portada) → 55 artículos MDX + 90 listas JSON + 82 tablas JSON. La navegación del sitio antiguo (subpáginas, "Read more…") se quita porque la app la genera.
- [x] `npm run migrate:redirects`: `public/_redirects` con 190 redirecciones de URLs viejas + fallback de SPA.
- [x] Componentes `lesson/`: `GrammarTable` (tonos, `rowspan`/`colspan`, fórmulas, deslizable en móvil si tiene más de 3 columnas), `Examples`, `WordList`, `ChildLessons`, `LessonFooter` (ejercicios relacionados + anterior/siguiente), `mdx-components`.
- [x] Rutas reales: `/biblioteca` (con número de lecciones), `/biblioteca/$section` (lecciones con sus hijas), `/biblioteca/$section/$` (carga diferida del cuerpo en el `loader`), `/ejercicios/$id` (título real o 404).
- [x] `npm run content:check`: esquemas, MDX que compila, tablas importadas que existen, ids únicos, huecos `___` = respuestas, índices de `answer`, enlaces internos, `related`/`lessons` válidos, más un informe de traducción y de sets sin revisar. Se probó que detecta errores a propósito.
- [x] **No migrado (decisión):** las páginas legales y de contacto del sitio original no describen esta app (no hay cookies, servidor ni formularios). Habrá que escribir textos propios antes de publicar (F19).
- [x] Los PDF se quedan en `legacy/` hasta F11; ya no se copian a `public/` porque son interactivos.

**Listo cuando:** las 145 lecciones se ven en la app, hay 35 sets JSON y `content:check` pasa. ✅

#### F5 — Motor de ejercicios (tipos básicos)
*Aprendes: componentes controlados, formularios, eventos de teclado, tests de lógica, Zustand.*
- [x] `check.ts` + tests (normalización, contracciones, casi, varias respuestas). La regla del “casi” está en §7.3.
- [x] `ExercisePlayer`, `ResultScreen`, modos práctica y examen. El modo va en la URL (`?modo=examen`); cada ítem es un `ItemStep` con `key` para que su estado se reinicie solo. “Repetir los fallados” no cuenta como intento.
- [x] Tipos: `fill-blank`, `multiple-choice`, `true-false`, `word-order` (tocar fichas; arrastrar en F9), `transform`, `error-correction`. Los sets con tipos de F9 se saltan esos ítems.
- [x] `/ejercicios` (catálogo con filtros de nivel y tema en la URL, ordenado por nivel) y `/ejercicios/$id` (`$id/route.tsx` carga el set una vez para el player y la versión imprimible).
- [x] `/ejercicios/$id/imprimir` (estilos de impresión + clave en página aparte). Cabecera, migas y pie llevan `print:hidden`; los colores oscuros solo se aplican en `@media screen`, así que en papel siempre sale en claro.
- [x] `npm i zustand`; store de progreso (§7.6), salvo el repaso de errores: notas por set, fallos, racha y último set (`efy-progress`, `version: 1`). Página `/progreso` con resumen y “Borrar mi progreso”. Sin `zod/mini` de momento: los datos solo los escribe la propia app.
- [x] Tests de componente para cada tipo con Testing Library, más un test del flujo completo (práctica, casi, examen, repetir fallados). Vitest con `vitest.config.ts` propio (sin el plugin del router ni MDX). 61 tests.
- [x] `content:check` añade: `explanationEs` obligatoria en sets `original`, fichas iguales en todas las respuestas de un `word-order` y fragmento único en `error-correction`.
- [x] Set de muestra `original/muestra-tipos-basicos.json` (12 ítems, 2 por tipo, A1, `reviewed: false`) para probar los tipos que no usan los worksheets.
- **Pendiente → backlog:** modo lista en escritorio (§7.4), aviso de `content:check` sobre variantes UK/US (§7.3) y explicación específica del “casi”.

**Listo cuando:** los 35 worksheets se juegan de principio a fin, los resultados se guardan y la versión imprimible sale bien en papel/PDF del navegador. ✅

#### F6 — Curso de Fundamentos I (unidades 1–8)
*Aprendes: componer páginas a partir de datos, MDX con componentes propios.*
- [x] Componentes de unidad: `Formula` (bloques de color), objetivos, lista de sets por parte y tarjeta de repaso (en `features/course/unit-view.tsx`). Para el MDX: `Formula`, `Modes` (pos/neg/q), `Explain`, `Tip`, `CommonMistake` y `FalseFriend`, más estilos para tablas Markdown.
- [x] `/curso` (mapa por bloques con estado y unidad recomendada) y `/curso/$unidad`.
- [x] Escribir las unidades 1–8 según §6.2 y enlazar los worksheets de las unidades 3, 4 y 7.
- [x] Ejercicios originales: **sets de muestra** por unidad: práctica guiada (6 ítems: opción múltiple, verdadero/falso, ordenar), práctica libre (6: completar, transformar, corregir) y repaso (8 mezclados). 160 ítems en total, todos `reviewed: false`. El volumen completo (40–60 ítems) y el proceso de escritura y revisión dependen de **D1** (§14).
- [x] Portada con “Empieza aquí” (o “Tu siguiente unidad”) y “Continúa donde lo dejaste”.
- [x] Los sets saben a qué unidad pertenecen: “Volver a la unidad” y “Siguiente ejercicio” sigue el orden de la unidad. En el catálogo aparecen con el tema “Curso”.

**Listo cuando:** un principiante puede hacer las 8 unidades, ve su estado en `/curso` y las dominadas quedan marcadas. ✅

#### F7 — Despliegue privado + CI
*Aprendes: GitHub Actions, despliegues de previsualización.*
- [x] GitHub Actions (`.github/workflows/ci.yml`): `typecheck`, `lint`, `format:check`, `test`, `content:check` y `build` en cada PR, en cada push a `main` y a mano. Node fijado en `.node-version` (24) para local, CI y Cloudflare. Probado en local con los mismos pasos; `npm ci --dry-run` confirma que el lockfile está sincronizado e incluye los binarios de Linux.
- [x] Configuración de despliegue: **Cloudflare Pages + Cloudflare Access** (gratis hasta 50 personas; la protección de Netlify es de pago). Fallback SPA en `public/_redirects` y `X-Robots-Tag: noindex` en `public/_headers` mientras sea privado. Pasos en [DESPLIEGUE.md](DESPLIEGUE.md).
- [ ] **Pendiente del dueño del repo:** subir la rama a GitHub, crear el proyecto en Cloudflare Pages y activar Access (requiere su cuenta). Hasta fusionar `migracion-react` en `main`, usar la vista previa de la rama o ponerla como rama de producción.

**Listo cuando:** cada push a `main` despliega y la CI está en verde.

### Etapa 2 — Fundamentos II + herramientas

#### F8 — Curso de Fundamentos II (unidades 9–16)
- [ ] Unidades 9–16 según §6.1 y §6.2, con sus worksheets enlazados.

#### F9 — Más tipos de ejercicio
*Aprendes: arrastrar y soltar accesible, Web Speech API.*
- [ ] `npm i @dnd-kit/core @dnd-kit/sortable`; arrastrar en `word-order` y `categorize`.
- [ ] `match`, `categorize`, `translate`, `dictation`, `table-fill`, `listen-choose`.
- [ ] `lib/speech.ts`: voz `en-*`, velocidad ajustable y detección de soporte. `dictation` y `listen-choose` se ocultan si no hay voces.
- [ ] Añadir sets de estos tipos a las unidades 1–16.

#### F10 — Tense Lab + ejercicios generados
- [ ] Tense Lab en React (`?tense=` en la URL), con colores pos/neg/q y bloques.
- [ ] `generators/tenses.ts` (transformar, auxiliar, ordenar, tabla) y `data/irregular-verbs.ts` + generador.
- [ ] Botón “Practicar este tiempo” en el Tense Lab y en las lecciones de tiempos verbales.

#### F11 — Paridad y limpieza
- [ ] Buscador MiniSearch (lecciones, unidades, sets y palabras EN/ES; Ctrl/Cmd+K y `/buscar`).
- [ ] Interruptor “Mostrar traducciones”; botón 🔊 en ejemplos.
- [ ] Revisión de paridad sección por sección frente a `legacy/`.
- [ ] Borrar `legacy/` y los PDF; archivar `scripts/migrate/`; `_redirects` final.

#### F12 — Repaso inteligente
- [ ] “Repasar mis errores” (`/repaso`), con salida tras 2 aciertos en días distintos.
- [ ] Repaso mixto por bloque (ítems al azar de las unidades dominadas).
- [ ] `/progreso`: unidades, sets, racha y errores pendientes.

### Etapa 3 — Vocabulario activo
#### F13 — Flashcards
- [ ] Leitner por palabra (`"seccion/slug#en"`), EN→ES y ES→EN, Espacio para girar y 1/2 para responder.
#### F14 — Ejercicios de vocabulario
- [ ] Generadores desde wordlists; traducciones `es` de las listas A1–A2; componentes `FalseFriend` en las listas.
#### F15 — Phrasal verbs, collocations, ways to say
- [ ] Datos estructurados (verbo + partícula + significado + ejemplo) y ejercicios de completar y elegir partícula.

### Etapa 4 — Gramática intermedia
#### F16 — Unidades B1–B2
- [ ] Unidades de §6.1 (intermedio), con todos los worksheets restantes enlazados.
#### F17 — Prueba de nivel
- [ ] Unos 30 ítems escalonados A1→B2; recomienda una unidad y marca como vistas las anteriores.

### Etapa 5 — Calidad, offline y publicación
#### F18 — Calidad y PWA
- [ ] Playwright: portada → unidad → set → resultado → repaso; axe en 6 páginas clave.
- [ ] `vite-plugin-pwa` (precache de la app y del contenido).
- [ ] JS inicial < 200 KB gzip; Lighthouse ≥ 90 en rendimiento y accesibilidad.
- [ ] Metadatos por ruta (`head` de TanStack Router).
#### F19 — SEO y publicación
- [ ] Migrar a TanStack Start con prerender de las rutas del manifiesto; `sitemap.xml`.
- [ ] Publicación pública **solo tras resolver los derechos del contenido** (§14).

---

## 12. Calidad y convenciones

- TypeScript strict, sin `any`; datos externos validados con Zod.
- Tests:
  - `check.ts`, generadores y store → Vitest, con cobertura alta.
  - Tipos de ejercicio → Testing Library.
  - Flujos de usuario → Playwright.
  - Contenido → `content:check`.
- Commits pequeños, en español, uno por tarea de la checklist. El contenido
  generado va en commits separados.
- Accesibilidad: teclado completo en todos los ejercicios, `aria-live` para
  anunciar si la respuesta es correcta y el color nunca es la única señal.

## 13. Backlog (después de la etapa 5)

Cada idea se evalúa cuando llegue el momento y, si se aprueba, se convierte en
una etapa nueva:
- Cuentas y sincronización entre dispositivos (requiere backend).
- Gamificación: XP, logros y metas diarias.
- **Speaking**: repetir frases con `SpeechRecognition` y comparar.
- Lecturas graduadas con preguntas de comprensión.
- Listening con audios reales.
- Corrección de textos libres con IA (Claude API), con explicación en español.
- Exportar e importar el progreso (JSON).
- Modo profesor: crear sets propios y compartirlos por enlace.
- Otros idiomas de origen (portugués…).
- Motor de ejercicios (pendientes de F5): modo lista en escritorio como el
  worksheet original; explicación específica del “casi” cuando coincide con
  otro hueco o con un error típico; aviso de `content:check` sobre palabras
  con variantes UK/US que no estén en `answers`.

## 14. Decisiones pendientes

| # | Decisión | Estado | Cuándo se retoma |
|---|---|---|---|
| D1 | **Quién escribe y revisa los ejercicios originales** (borrador con IA + revisión humana, escritos a mano por el dueño, o una mezcla) y el volumen final por unidad | ⏸️ Pendiente | Cuando la app esté completa y el dueño la haya usado como estudiante. Hasta entonces, las unidades llevan solo los ejercicios mínimos para probar el motor (ver F6). |

## 15. Riesgos

| Riesgo / decisión | Mitigación / propuesta |
|---|---|
| **Derechos del contenido** (englishforyourself.com vía Wayback, incluidos los worksheets) | Confirmar permiso o reescribir. Hasta entonces, despliegue privado. Los ejercicios `original` y las unidades del curso son propios y no tienen este problema. |
| Escribir 40–60 ejercicios buenos por unidad lleva tiempo | Plantilla fija (§6.2) y generadores para la práctica repetitiva; el proceso de escritura se define en D1 (§14). |
| Respuestas válidas no previstas marcadas como error | Normalización + contracciones + “casi”; botón “Creo que mi respuesta es correcta” que lo anota localmente para revisarlo. |
| Extracción de PDF con caracteres corruptos | Informe + revisión manual de los 350 ítems (F4). |
| TTS desigual entre navegadores | Detectar soporte y ocultar los ejercicios de audio si no hay voces. |
| La SPA no es indexable | Aceptable hasta F19. |
| Crece el alcance | Todo lo nuevo entra al backlog; ninguna etapa empieza sin cerrar la anterior. |

## 16. Comandos de referencia

```bash
npm run dev            # http://localhost:5173
npm run build · npm run preview
npm run typecheck · npm run lint · npm run format
npm test               # vitest
npm run e2e            # playwright
npm run content:check  # valida contenido y ejercicios
npm run migrate        # (F4) legacy/ → src/content/
npx shadcn@latest add <componente>
```
