import { Search } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { es } from "@/i18n/es";

// React.lazy: el diálogo (con MiniSearch y el índice) es un chunk aparte que solo se
// descarga al abrir el buscador. Así no pesa en la carga inicial de la app.
const loadDialog = () => import("./search-dialog");
const SearchDialog = lazy(() => loadDialog().then((m) => ({ default: m.SearchDialog })));

// ¿Está la persona escribiendo en un campo? Entonces "/" es una barra, no un atajo
function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function SearchButton() {
  const [open, setOpen] = useState(false);

  // Atajos globales: Ctrl/Cmd+K y "/". Un efecto es lo correcto aquí: hay que
  // suscribirse a un evento del navegador y desuscribirse al desmontar.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shortcut =
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !isTyping(event.target));
      if (!shortcut) return;
      event.preventDefault();
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        // Se descarga al acercarse al botón: al abrirlo ya está listo (import() se cachea)
        onPointerEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        aria-keyshortcuts="Control+K Meta+K /"
        aria-label={es.search.button}
        className="gap-2 text-muted-foreground"
      >
        <Search aria-hidden />
        <span className="hidden sm:inline">{es.search.button}</span>
        <kbd className="hidden rounded border bg-muted px-1 text-[10px] lg:inline">Ctrl K</kbd>
      </Button>
      {open && (
        <Suspense fallback={null}>
          <SearchDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}
