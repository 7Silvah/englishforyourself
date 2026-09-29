# English for Yourself — sitio estático moderno

Lecciones gratuitas de inglés: gramática, tiempos verbales, vocabulario por temas,
*ways to say*, phrasal verbs, collocations, idioms y worksheets imprimibles en PDF.

El contenido educativo proviene del sitio **englishforyourself.com** (fuera de línea
desde ~junio 2026), recuperado del archivo público de Wayback Machine (Internet
Archive) y re-maquetado con un diseño moderno. No hay affiliation con los autores
originales.

## Verlo en tu computadora

**Opción 1 — doble clic (más fácil):**
abre el archivo `index.html` en tu navegador. Todo funciona sin servidor:
navegación, buscador y PDFs.

**Opción 2 — servidor local (recomendado):**
```bash
cd englishforyourself
python3 -m http.server 8000
```
y abre http://localhost:8000 en tu navegador.

## Estructura del repo

```
index.html                  ← portada: hero, buscador y tarjetas por sección
about.html                  ← página "More information about English"
assets/
  css/style.css             ← todo el diseño (CSS vanilla, sin frameworks)
  js/main.js                ← menú móvil (vanilla JS)
  js/search-data.js         ← índice del buscador (generado automáticamente)
  pdf/                      ← los 35 worksheets de ejercicios en PDF
lessons/                    ← las 8 secciones del sitio
  verb-tenses/              ← tiempos verbales (14 lecciones + overview)
  vocabulary/               ← vocabulario por temas (~52 lecciones)
  ways-to-say/              ← expresiones cotidianas (14 lecciones)
  phrasal-verbs/            ← phrasal verbs por lista y partícula (13)
  collocations/             ← collocations por verbo (15)
  idioms/                   ← idioms comunes y por tema (3)
  grammar/                  ← adjetivos, condicionales, voz pasiva, etc. (~40)
  worksheets/               ← índice de ejercicios + enlaces a los PDFs
    index.html              ← portada de la sección
    <slug>.html             ← lección (los subtemas conservan subcarpetas)
legal/
  cookie-policy.html / privacy-policy.html / terms-and-conditions.html
  contact.html / contact-2.html / index.html (archivo de páginas legales)
```

Sin nomenclatura de WordPress: no hay `wp-content/`, `wp-includes/` ni
`wp-json/` en ninguna ruta. Las 161 páginas conservan sus slugs originales,
reubicadas bajo `lessons/<sección>/`. La navegación, breadcrumbs, buscador y
enlaces entre lecciones funcionan con rutas relativas, así que el sitio corre
igual con doble clic (`file://`) o con un servidor local.

## Cómo se genera

El sitio se genera de forma reproducible con `../efy-build/build.py` (no
incluido en este repo): toma el contenido de la reconstrucción original
(`../englishforyourself-rebuild/site/`, intacta), lo re-maqueta con la
plantilla moderna, reescribe todos los enlaces internos a la nueva
estructura, mueve los PDFs a `assets/pdf/`, convierte los charts a tablas
(vía `../efy-build/tables/apply_tables.py`) y regenera el buscador.

## Buscador

La portada incluye un buscador que filtra las 154 lecciones en vivo, sin servidor
ni internet: los datos van embebidos en `assets/js/search-data.js`.

## Tablas gramaticales en HTML

Los charts de gramática del sitio original eran imágenes (JPG/PNG). Aquí están
convertidos a tablas HTML reales (`<table class="gtable">`), con los mismos
colores e intención visual: 40 imágenes reemplazadas en 28 lecciones
(tiempos verbales, adjetivos, adverbios, pronombres, verbos, reported speech,
voz pasiva, condicionales, etc.). Las imágenes que ya no usa ninguna página
fueron eliminadas del repo. Las tablas se generan de forma reproducible con
`../efy-build/tables/apply_tables.py` (fragmentos + manifiestos en
`../efy-build/tables/`), que `build.py` ejecuta automáticamente al regenerar.

## Correcciones de contenido

El contenido heredado del sitio original pasó por una auditoría de calidad
(2026-09-29): se corrigieron typos ("perferct" → "perfect", "Positve" →
"Positive", "hobbie" → "hobby", etc.), errores factuales de gramática
("He have lived" → "He has lived", "She suggested me to arrive" →
"She suggested arriving", regla "suggest + to infinitive" corregida a
gerundio/that-clause), definiciones erróneas de idioms y phrasal verbs,
collocations inexistentes eliminadas y duplicados limpiados. Los cambios se
hicieron en la fuente (`englishforyourself-rebuild/site/` y fragmentos en
`../efy-build/tables/`) para que `build.py` los conserve al regenerar.

## Publicarlo online (opcional)

Es un sitio 100% estático: súbelo a GitHub Pages, Netlify o Vercel tal cual.
En GitHub: *Settings → Pages → Deploy from a branch → main → /(root)*.

## Regenerar

El diseño se genera con `../efy-build/build.py` (no incluido en este repo):
toma el contenido de la reconstrucción original y le aplica la plantilla
moderna, produciendo directamente esta estructura. Ver la sección
"Cómo se genera" más arriba.
