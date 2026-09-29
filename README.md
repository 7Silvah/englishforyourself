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
index.html                  ← portada nueva: hero, buscador y tarjetas por sección
english-verb-tenses/        ← tiempos verbales (14 lecciones)
english-verb-tenses-2/
vocabulary/                 ← vocabulario por temas (~45 lecciones)
ways-to-say/                ← expresiones cotidianas (14 lecciones)
phrasal-verbs/              ← phrasal verbs por lista y partícula
collocations/               ← collocations por verbo
idioms/                     ← idioms comunes y por tema
<temas de gramática>/       ← adjetivos, condicionales, voz pasiva, etc.
english-grammar-exercises-worksheets/  ← índice + 35 PDFs de ejercicios
wp-content/uploads/         ← imágenes y PDFs
assets/
  css/style.css             ← todo el diseño (CSS vanilla, sin frameworks)
  js/main.js                ← menú móvil (vanilla JS)
  js/search-data.js         ← índice del buscador (generado automáticamente)
```

Las rutas y nombres de las 161 páginas se conservaron del sitio original para
mantener coherencia con su mapa del sitio.

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
toma el contenido de la reconstrucción original y le aplica la plantilla moderna.
