import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { es } from "@/i18n/es";
import { getSearchIndex } from "./documents";
import { groupHits, search } from "./engine";
import { SearchHit } from "./search-hit";
import { useOpenTarget } from "./use-open-target";

const t = es.search;

// Buscador rápido (Ctrl/Cmd+K). Se carga con React.lazy desde la cabecera: el índice
// y todas las palabras solo se descargan la primera vez que se abre.
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => search(getSearchIndex(), query, 50), [query]);
  const openTarget = useOpenTarget();
  const navigate = useNavigate();
  const typed = query.trim().length >= 2;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.title}
      description={t.description}
      className="sm:max-w-xl"
    >
      {/* MiniSearch ya filtra y ordena: cmdk no debe volver a filtrar */}
      <Command shouldFilter={false}>
        <CommandInput value={query} onValueChange={setQuery} placeholder={t.placeholder} />
        <CommandList>
          {!typed && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t.hint}</p>
          )}
          {typed && <CommandEmpty>{t.empty(query.trim())}</CommandEmpty>}
          {groupHits(hits, 5).map((group) => (
            <CommandGroup key={group.type} heading={t.groups[group.type]}>
              {group.hits.map((hit) => (
                <CommandItem
                  key={hit.id}
                  value={hit.id}
                  onSelect={() => {
                    onOpenChange(false);
                    void openTarget(hit.target);
                  }}
                >
                  <SearchHit hit={hit} />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          {hits.length > 0 && (
            <CommandGroup>
              <CommandItem
                value="__all"
                onSelect={() => {
                  onOpenChange(false);
                  void navigate({ to: "/buscar", search: { q: query.trim() } });
                }}
              >
                {t.seeAll(hits.length)}
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
