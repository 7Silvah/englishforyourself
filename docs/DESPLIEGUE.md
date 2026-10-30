# Despliegue privado

Mientras no se confirmen los derechos del contenido (ver «Riesgos» en
[PLAN.md](PLAN.md)), la app se despliega **solo para quien tenga permiso**. La
opción elegida es **Cloudflare Pages + Cloudflare Access**: gratis hasta 50
personas, y quien abra la web tiene que identificarse con un código que llega
por correo.

> ¿Por qué no Netlify? Su protección con contraseña es de pago. La configuración
> del repo sirve igual para los dos (`public/_redirects` y `public/_headers`), así
> que se puede cambiar de proveedor sin tocar código.

## Qué hay en el repo

| Archivo | Para qué |
|---|---|
| `.github/workflows/ci.yml` | CI: tipos, lint, formato, tests, `content:check` y build en cada PR y en cada push a `main`. |
| `.node-version` | Versión de Node (24), la misma en local, en la CI y en Cloudflare. |
| `public/_redirects` | Redirecciones de las URL antiguas y, al final, el *fallback* de la SPA (`/* /index.html 200`). |
| `public/_headers` | `X-Robots-Tag: noindex`: que los buscadores no indexen la web mientras sea privada. Se quita en F19. |

## 1. Crear el proyecto en Cloudflare Pages

1. Entra en el panel de Cloudflare → **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**.
2. Autoriza a Cloudflare en GitHub y elige el repositorio `englishforyourself`.
3. Configura la build:
   - **Framework preset**: React (Vite)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Production branch**: `main` (ver la nota de abajo)
4. **Save and Deploy**. Cada push a la rama de producción despliega
   `englishforyourself.pages.dev`; cada push a otra rama crea una vista previa en
   `<rama>.englishforyourself.pages.dev`.

> **Mientras dure la migración**, `main` todavía es el sitio antiguo. Hasta
> fusionar `migracion-react` en `main` tienes dos opciones: usar la vista previa
> de la rama (`migracion-react.englishforyourself.pages.dev`) o poner
> temporalmente `migracion-react` como rama de producción en
> **Settings → Builds → Branch control**.

## 2. Protegerlo con Cloudflare Access

Por defecto todo es público. Para cerrarlo:

1. En el proyecto: **Settings → General → Enable access policy**. Esto protege
   **solo las vistas previas**.
2. Para proteger también `englishforyourself.pages.dev`:
   1. Pulsa **Manage** en la política que se acaba de crear.
   2. En **Access → Applications**, elige el proyecto → **Configure**.
   3. En **Public hostname**, borra el comodín (`*`) del campo **Subdomain** y guarda
      (si da error, cambia también el nombre de la aplicación).
   4. Vuelve a **Settings → General** y pulsa otra vez **Enable access policy**.
   5. Comprueba que hay **dos** aplicaciones de Access: una para
      `englishforyourself.pages.dev` y otra para `*.englishforyourself.pages.dev`.
3. En cada aplicación de Access, en la política (**Policies**), añade los correos
   de las personas que pueden entrar (regla *Emails*).
4. Prueba en una ventana privada: debe pedir el correo y un código antes de
   mostrar la app.

## 3. CI en GitHub

La CI se ejecuta sola en cada pull request y en cada push a `main`. También se
puede lanzar a mano desde la pestaña **Actions** (*Run workflow*).

Para que nada roto llegue a `main`, en GitHub: **Settings → Branches → Add
branch ruleset** sobre `main`, con **Require status checks to pass** y el check
**Tipos, lint, tests y build**.

## Comprobar un despliegue

- La portada carga y la navegación funciona.
- Recargar una URL interna (por ejemplo `/curso/verbo-to-be`) no da 404 (*fallback* de la SPA).
- Una URL antigua (por ejemplo `/lessons/grammar/articles.html`) redirige a la Biblioteca.
- En las herramientas del navegador → **Red**, la respuesta lleva `X-Robots-Tag: noindex, nofollow`.
