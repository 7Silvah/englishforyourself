# Guía Git — trabajando en la rama `feature`

> Propósito educativo: los comandos que vas a usar mientras trabajamos en este
> proyecto, qué hace cada uno y cuándo usarlo.

## La idea en 30 segundos

- **`main`** → la versión estable, la que "sí funciona". Protegida: nadie le hace
  push directo.
- **`feature`** → la rama de trabajo, donde se cocinan los cambios.
- Cuando algo en `feature` está probado y bueno, se lleva a `main` con un
  **Pull Request** (PR).

## Comandos para ubicarte

| Comando | Qué hace | Cuándo usarlo |
|---|---|---|
| `git status` | Muestra en qué rama estás y qué archivos cambiaron | Siempre, antes de cualquier otra cosa |
| `git branch` | Lista tus ramas locales (el `*` marca la actual) | Para confirmar dónde estás parado |
| `git log --oneline -10` | Historial corto de los últimos 10 commits | Para ver qué se hizo recientemente |

## Comandos para actualizarte (los que ya viste)

| Comando | Qué hace | Cuándo usarlo |
|---|---|---|
| `git fetch origin` | Pregunta a GitHub qué hay de nuevo (ramas, commits) **sin tocar** tus archivos. Solo es "enterarse". | Antes de cambiarte de rama o de revisar algo nuevo |
| `git checkout feature` | Te cambia a la rama `feature` (tus archivos pasan a reflejar esa rama) | Para moverte a la rama de trabajo |
| `git pull origin feature` | Trae los últimos cambios de `feature` desde GitHub a tu compu. Es `fetch` + fusión en un solo paso. | Cada vez que vayas a revisar algo nuevo que subí |

> Versión moderna de `checkout`: `git switch feature` hace lo mismo y es más
> claro. Ambos valen.

## Si TÚ editas archivos

| Comando | Qué hace | Cuándo usarlo |
|---|---|---|
| `git diff` | Muestra qué cambiaste, línea por línea, antes de guardarlo | Para revisar antes de hacer commit |
| `git add <archivo>` | Marca el archivo para incluirlo en el próximo commit | Después de editar, archivo por archivo |
| `git commit -m "mensaje"` | Guarda tus cambios localmente con un mensaje descriptivo | Para "congelar" un cambio terminado |
| `git push origin feature` | Sube tus commits locales a la rama `feature` en GitHub | Para compartir tus cambios |

## Para llevar algo a `main`

1. En GitHub: **Pull requests → New pull request**, base: `main`, compare: `feature`.
2. Revisa los cambios, y **Merge pull request**.
3. Después del merge, actualiza tu copia: `git checkout main` y `git pull origin main`.

## Receta típica de cada sesión

```bash
git status            # ¿dónde estoy y qué cambió?
git fetch origin      # ¿qué hay de nuevo en GitHub?
git checkout feature  # me paro en la rama de trabajo
git pull origin feature  # traigo lo último
# ... abres index.html y revisas los cambios ...
```

## Si algo se queja

- `git pull` dice que tienes cambios locales sin guardar → primero
  `git stash` (los guarda temporalmente), luego `git pull`, luego
  `git stash pop` (los devuelve).
- No sabes en qué rama estás → `git status`, la primera línea te lo dice.
