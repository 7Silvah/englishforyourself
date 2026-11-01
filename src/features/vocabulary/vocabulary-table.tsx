import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useRef, type ReactNode } from "react";
import { FalseFriendBadge } from "@/components/lesson/false-friend-badge";
import { SpeakButton } from "@/components/lesson/speak-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Word, WordList } from "@/content/schema";
import { useSettingsStore } from "@/features/settings/store";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { filterGroups, WORD_TYPES, type VocabularyFilters } from "./logic";

const t = es.library.vocabularyTable;
const ROUTE = "/biblioteca/$section/$";

// Un filtro es un enlace: el estado vive en la URL (?letra=B&tipo=verb) y se puede compartir
function FilterLink({
  search,
  active,
  children,
}: {
  search: VocabularyFilters;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      from={ROUTE}
      to="."
      search={search}
      replace
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-sm transition-colors hover:bg-muted",
        active && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      {children}
    </Link>
  );
}

function WordRow({ word, showEs }: { word: Word; showEs: boolean }) {
  const meanings = word.meanings ?? [];
  return (
    <tr className="flex flex-col gap-1 border-b px-1 py-3 md:table-row">
      <td className="align-top md:w-56 md:py-3 md:pr-4">
        <span className="flex items-center gap-1">
          <span lang="en" className="font-semibold">
            {word.en}
          </span>
          <SpeakButton text={word.en} label={t.listenWord(word.en)} className="size-7" />
        </span>
        {word.ipa && (
          <span lang="en-fonipa" title={t.ipaLabel} className="text-sm text-muted-foreground">
            /{word.ipa}/
          </span>
        )}
      </td>
      <td className="align-top text-sm text-muted-foreground md:w-28 md:py-3 md:pr-4">
        {word.pos && t.pos[word.pos]}
      </td>
      {showEs && (
        <td className="align-top md:w-56 md:py-3 md:pr-4">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {word.es ?? "—"}
            {word.falseFriend && <FalseFriendBadge word={word.falseFriend} />}
          </span>
          {word.note && <p className="mt-1 text-sm text-muted-foreground">{word.note}</p>}
        </td>
      )}
      <td className="align-top text-sm md:py-3">
        {meanings.length === 1 && <p lang="en">{meanings[0]}</p>}
        {meanings.length > 1 && (
          <ol lang="en" className="list-decimal space-y-0.5 pl-5">
            {meanings.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
        )}
        {word.example && (
          <p lang="en" className="mt-1 text-muted-foreground italic">
            {word.example}
          </p>
        )}
        {showEs && word.exampleEs && <p className="text-muted-foreground">{word.exampleEs}</p>}
      </td>
    </tr>
  );
}

export function VocabularyTable({ list, filters }: { list: WordList; filters: VocabularyFilters }) {
  const navigate = useNavigate({ from: ROUTE });
  const searchInput = useRef<HTMLInputElement>(null);
  const showTranslations = useSettingsStore((state) => state.showTranslations);
  const setShowTranslations = useSettingsStore((state) => state.setShowTranslations);

  // Filtrar 1000 palabras sin tildes en cada tecla no es gratis: solo cuando cambian
  const groups = useMemo(() => filterGroups(list.groups, filters), [list.groups, filters]);
  const total = list.groups.reduce((n, g) => n + g.items.length, 0);
  const shown = groups.reduce((n, g) => n + g.items.length, 0);
  const hasTranslations = list.groups.some((g) => g.items.some((w) => w.es));
  const showEs = hasTranslations && showTranslations;
  const filtered = Boolean(filters.letra || filters.tipo || filters.q);

  const clear = () => {
    if (searchInput.current) searchInput.current.value = "";
    void navigate({ search: {}, replace: true });
  };

  return (
    <div className="space-y-6">
      {list.introEs && <p className="leading-7">{list.introEs}</p>}

      <div className="space-y-3 rounded-xl border bg-card p-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {t.search}
          <span className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            {/* No controlado: el texto vive en la URL (?q=), que se actualiza con cada tecla
                sin llenar el historial (replace) */}
            <Input
              ref={searchInput}
              type="search"
              defaultValue={filters.q ?? ""}
              placeholder={t.searchPlaceholder}
              className="pl-8"
              onChange={(e) => {
                const q = e.target.value;
                void navigate({
                  search: (prev) => ({ ...prev, q: q || undefined }),
                  replace: true,
                });
              }}
            />
          </span>
        </label>

        <div role="group" aria-label={t.type} className="flex flex-wrap items-center gap-1.5">
          <span className="w-14 text-sm font-medium">{t.type}</span>
          <FilterLink search={{ ...filters, tipo: undefined }} active={!filters.tipo}>
            {t.all}
          </FilterLink>
          {WORD_TYPES.map((type) => (
            <FilterLink
              key={type}
              search={{ ...filters, tipo: type }}
              active={filters.tipo === type}
            >
              {t.types[type]}
            </FilterLink>
          ))}
        </div>

        <div role="group" aria-label={t.letter} className="flex flex-wrap items-center gap-1.5">
          <span className="w-14 text-sm font-medium">{t.letter}</span>
          <FilterLink search={{ ...filters, letra: undefined }} active={!filters.letra}>
            {t.all}
          </FilterLink>
          {list.groups.map((g) =>
            g.title ? (
              <FilterLink
                key={g.title}
                search={{ ...filters, letra: g.title, q: undefined }}
                active={filters.letra === g.title}
              >
                {g.title}
              </FilterLink>
            ) : null,
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* aria-live: el lector de pantalla anuncia cuántas palabras quedan al filtrar */}
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {t.showing(shown, total)}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {filtered && (
              <Button variant="ghost" size="sm" onClick={clear}>
                {t.clear}
              </Button>
            )}
            {hasTranslations && (
              <label className="flex items-center gap-2 text-sm font-medium">
                <Switch checked={showTranslations} onCheckedChange={setShowTranslations} />
                {es.library.showTranslations}
              </label>
            )}
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          {t.empty}
        </p>
      ) : (
        <table className="block w-full text-left md:table">
          <caption className="sr-only" lang="en">
            {list.title}
          </caption>
          <thead className="hidden border-b text-sm md:table-header-group">
            <tr>
              <th scope="col" className="py-2 pr-4 font-medium">
                {t.columns.word}
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                {t.columns.type}
              </th>
              {showEs && (
                <th scope="col" className="py-2 pr-4 font-medium">
                  {t.columns.spanish}
                </th>
              )}
              <th scope="col" className="py-2 font-medium">
                {t.columns.meaning}
              </th>
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.title} className="block md:table-row-group">
              <tr className="block md:table-row">
                <th
                  scope="colgroup"
                  colSpan={showEs ? 4 : 3}
                  className="block bg-muted px-2 py-1 font-heading text-lg font-semibold md:table-cell"
                >
                  {g.title}
                </th>
              </tr>
              {g.items.map((w) => (
                <WordRow key={`${w.en}|${w.pos ?? ""}`} word={w} showEs={showEs} />
              ))}
            </tbody>
          ))}
        </table>
      )}
    </div>
  );
}
