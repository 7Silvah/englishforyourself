import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Star, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { FalseFriendBadge } from "@/components/lesson/false-friend-badge";
import { SpeakButton } from "@/components/lesson/speak-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { LEVELS } from "@/content/levels";
import { useSettingsStore } from "@/features/settings/store";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import { LevelBadge } from "./level-badge";
import {
  countByTopic,
  pageNumbers,
  pageOf,
  wordKeys,
  type Topic,
  type VocabularyEntry,
  type VocabularyGroup,
} from "./logic";
import { wordFilters, WORD_TYPES, type VocabularyFilters } from "./filters";
import { useVocabularyStore } from "./store";

const t = es.library.vocabularyTable;
const ROUTE = "/biblioteca/$section/";
// Filas por página: todas (más de 4000) harían lenta la página
const PAGE_SIZE = 50;

// Un filtro es un enlace: el estado vive en la URL (?nivel=A2&tipo=verb) y se puede
// compartir. Cambiar un filtro vuelve a la página 1 (wordFilters quita ?pagina=).
function FilterLink({
  search,
  active,
  children,
  className,
}: {
  search: VocabularyFilters;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      from={ROUTE}
      to="."
      search={search}
      replace
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-md px-2.5 py-1 text-sm transition-colors hover:bg-muted hover:text-foreground",
        active
          ? "bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

// Grupo de opciones con aspecto de control segmentado (Nivel, Tipo)
function Segmented({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-0.5 rounded-lg border bg-background p-0.5">{children}</div>
    </div>
  );
}

// La palabra resaltada dentro de su ejemplo («She does **aerobics** twice a week»)
function Example({ text, word }: { text: string; word: string }) {
  const key = wordKeys(word)[0];
  const at = key ? text.toLowerCase().indexOf(key) : -1;
  if (!key || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-semibold text-primary">{text.slice(at, at + key.length)}</strong>
      {text.slice(at + key.length)}
    </>
  );
}

function WordRow({
  word,
  showEs,
  favorite,
  filters,
}: {
  word: VocabularyEntry;
  showEs: boolean;
  favorite: boolean;
  filters: VocabularyFilters;
}) {
  const toggleFavorite = useVocabularyStore((state) => state.toggleFavorite);
  const meanings = word.meanings ?? [];
  return (
    <tr className="relative grid gap-2 border-b px-4 py-4 last:border-b-0 md:table-row md:px-0">
      <td className="align-top md:w-60 md:py-4 md:pl-6">
        <div className="flex items-start gap-2 pr-10 md:pr-0">
          <SpeakButton
            text={word.en}
            label={t.listenWord(word.en)}
            className="mt-0.5 size-8 shrink-0 rounded-full bg-muted"
          />
          <div>
            <span lang="en" className="text-base font-semibold">
              {word.en}
            </span>
            {word.ipa && (
              <span
                lang="en-fonipa"
                title={t.ipaLabel}
                className="block font-mono text-xs text-muted-foreground"
              >
                /{word.ipa}/
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="flex items-center gap-2 align-top md:table-cell md:w-20 md:py-4">
        {word.level && <LevelBadge level={word.level} />}
        {/* En el móvil el tipo va junto al nivel */}
        {word.pos && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs md:hidden">
            {t.pos[word.pos]}
          </span>
        )}
      </td>
      <td className="hidden align-top md:table-cell md:w-32 md:py-4">
        {word.pos ? (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{t.pos[word.pos]}</span>
        ) : (
          <span className="text-muted-foreground" aria-hidden>
            —
          </span>
        )}
      </td>
      {showEs && (
        <td className="align-top md:w-56 md:py-4 md:pr-4">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {word.es ?? "—"}
            {word.falseFriend && <FalseFriendBadge word={word.falseFriend} />}
          </span>
          {word.note && <p className="mt-1 text-sm text-muted-foreground">{word.note}</p>}
        </td>
      )}
      <td className="align-top text-sm md:py-4 md:pr-4">
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
            “<Example text={word.example} word={word.en} />”
          </p>
        )}
        {showEs && word.exampleEs && <p className="text-muted-foreground">{word.exampleEs}</p>}
        {word.topics.length > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-1 text-xs">
            <span className="sr-only">{t.topicsOf}:</span>
            {word.topics.map((topic) => (
              <Link
                key={topic.slug}
                from={ROUTE}
                to="."
                search={{ ...wordFilters(filters), tema: topic.slug, letra: undefined }}
                replace
                className="rounded-md border bg-background px-1.5 py-0.5 text-muted-foreground hover:text-foreground hover:underline"
              >
                {topic.title}
              </Link>
            ))}
          </p>
        )}
      </td>
      <td className="absolute top-3 right-3 md:static md:w-16 md:py-4 md:pr-6 md:text-right md:align-top">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-pressed={favorite}
          aria-label={t.favorite(word.en)}
          title={t.favorite(word.en)}
          onClick={() => toggleFavorite(word.id)}
          className={cn(favorite && "bg-primary/10 text-primary")}
        >
          <Star aria-hidden className={cn(favorite && "fill-current")} />
        </Button>
      </td>
    </tr>
  );
}

function Pagination({
  page,
  pages,
  filters,
}: {
  page: number;
  pages: number;
  filters: VocabularyFilters;
}) {
  const to = (n: number) => ({ ...filters, pagina: n > 1 ? n : undefined });
  const edge = "rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted";
  return (
    <nav aria-label={t.pagination} className="flex flex-wrap items-center gap-1">
      {page > 1 ? (
        <Link from={ROUTE} to="." search={to(page - 1)} className={edge}>
          {t.previous}
        </Link>
      ) : (
        <span className={cn(edge, "pointer-events-none opacity-50")} aria-disabled>
          {t.previous}
        </span>
      )}
      {pageNumbers(page, pages).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={n}
            from={ROUTE}
            to="."
            search={to(n)}
            aria-label={t.page(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              "grid size-8 place-items-center rounded-md text-sm transition-colors hover:bg-muted",
              n === page && "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
            )}
          >
            {n}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link from={ROUTE} to="." search={to(page + 1)} className={edge}>
          {t.next}
        </Link>
      ) : (
        <span className={cn(edge, "pointer-events-none opacity-50")} aria-disabled>
          {t.next}
        </span>
      )}
    </nav>
  );
}

/**
 * Tabla de Vocabulario (F17c V6). `groups` son todas las palabras (para las letras y el
 * recuento de cada tema) y `filtered`, las que pasan los filtros: las calcula la página,
 * que también las necesita para los botones de práctica.
 */
export function VocabularyTable({
  groups,
  filtered,
  topics,
  filters,
  favorites,
}: {
  groups: VocabularyGroup[];
  filtered: VocabularyGroup[];
  topics: Topic[];
  filters: VocabularyFilters;
  favorites: ReadonlySet<string>;
}) {
  const navigate = useNavigate({ from: ROUTE });
  const searchInput = useRef<HTMLInputElement>(null);
  const showTranslations = useSettingsStore((state) => state.showTranslations);
  const setShowTranslations = useSettingsStore((state) => state.setShowTranslations);

  // Atajo «/»: enfoca el buscador (como en GitHub o YouTube). Es una suscripción a un
  // evento del navegador: por eso va en un efecto, que la quita al salir de la página.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      const typing = target?.closest("input, textarea, select, [contenteditable=true]");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchInput.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const base = wordFilters(filters);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const shown = filtered.reduce((n, g) => n + g.items.length, 0);
  const pages = Math.max(1, Math.ceil(shown / PAGE_SIZE));
  const page = Math.min(filters.pagina ?? 1, pages);
  const visible = pageOf(filtered, page, PAGE_SIZE);
  const levels = LEVELS.filter((level) =>
    groups.some((g) => g.items.some((e) => e.level === level)),
  );
  const topicCounts = countByTopic(groups);
  const topicTitle = topics.find((x) => x.slug === filters.tema)?.title;
  const columns = showTranslations ? 6 : 5;

  const setQuery = (q: string) =>
    void navigate({ search: { ...base, q: q || undefined }, replace: true });
  const clear = () => {
    if (searchInput.current) searchInput.current.value = "";
    void navigate({ search: {}, replace: true });
  };

  // Chips de «Filtros aplicados»: cada uno es un enlace que quita su filtro
  const chips: { label: string; search: VocabularyFilters }[] = [];
  if (filters.nivel)
    chips.push({ label: t.chipLevel(filters.nivel), search: { ...base, nivel: undefined } });
  if (topicTitle)
    chips.push({ label: t.chipTopic(topicTitle), search: { ...base, tema: undefined } });
  if (filters.tipo)
    chips.push({ label: t.chipType(t.types[filters.tipo]), search: { ...base, tipo: undefined } });
  if (filters.letra)
    chips.push({ label: t.chipLetter(filters.letra), search: { ...base, letra: undefined } });
  if (filters.q) chips.push({ label: t.chipSearch(filters.q), search: { ...base, q: undefined } });
  if (filters.fav) chips.push({ label: t.chipFavorites, search: { ...base, fav: undefined } });

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
        <span className="relative block">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          />
          {/* No controlado: el texto vive en la URL (?q=), que se actualiza con cada tecla
              sin llenar el historial (replace) */}
          <Input
            ref={searchInput}
            type="search"
            aria-label={t.search}
            defaultValue={filters.q ?? ""}
            placeholder={t.searchPlaceholder}
            className="h-12 rounded-xl pr-20 pl-12 text-base md:text-base [&::-webkit-search-cancel-button]:hidden"
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5">
            {filters.q && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t.clearSearch}
                onClick={() => {
                  if (searchInput.current) searchInput.current.value = "";
                  setQuery("");
                }}
              >
                <X aria-hidden />
              </Button>
            )}
            <kbd
              title={t.searchShortcut}
              className="hidden rounded border px-1.5 text-xs text-muted-foreground sm:inline"
            >
              /
            </kbd>
          </span>
        </span>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Segmented label={t.level}>
            <FilterLink search={{ ...base, nivel: undefined }} active={!filters.nivel}>
              {t.allLevels}
            </FilterLink>
            {levels.map((level) => (
              <FilterLink
                key={level}
                search={{ ...base, nivel: level }}
                active={filters.nivel === level}
              >
                {level}
              </FilterLink>
            ))}
          </Segmented>

          {/* <select> nativo y no un menú: 49 temas se eligen bien con el selector del
              sistema (en el móvil, el suyo) y no añade código de menú a la página */}
          <label className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {t.topic}
            </span>
            <NativeSelect
              value={filters.tema ?? ""}
              onChange={(e) =>
                void navigate({
                  search: { ...base, tema: e.target.value || undefined, letra: undefined },
                  replace: true,
                })
              }
            >
              <NativeSelectOption value="">{t.allTopics}</NativeSelectOption>
              {topics.map((topic) => (
                <NativeSelectOption key={topic.slug} value={topic.slug}>
                  {t.topicOption(topic.title, topicCounts.get(topic.slug) ?? 0)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <Segmented label={t.type}>
            <FilterLink search={{ ...base, tipo: undefined }} active={!filters.tipo}>
              {t.all}
            </FilterLink>
            {WORD_TYPES.map((type) => (
              <FilterLink
                key={type}
                search={{ ...base, tipo: type }}
                active={filters.tipo === type}
              >
                {t.types[type]}
              </FilterLink>
            ))}
          </Segmented>
        </div>

        <div
          role="group"
          aria-label={t.letter}
          className="flex flex-wrap items-center gap-1 border-t pt-4"
        >
          <span className="mr-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {t.letter}
          </span>
          <FilterLink search={{ ...base, letra: undefined }} active={!filters.letra}>
            {t.all}
          </FilterLink>
          {groups.map((g) => (
            <FilterLink
              key={g.title}
              search={{ ...base, letra: g.title, q: undefined }}
              active={filters.letra === g.title}
              className="min-w-8 text-center"
            >
              {g.title}
            </FilterLink>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <FilterLink
              search={{ ...base, fav: filters.fav ? undefined : true }}
              active={Boolean(filters.fav)}
              className="flex items-center gap-1.5 border"
            >
              <Star aria-hidden className={cn("size-4", filters.fav && "fill-current")} />
              {t.onlyFavorites}
            </FilterLink>
            {chips.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">{t.applied}</span>
                {chips.map((chip) => (
                  <Link
                    key={chip.label}
                    from={ROUTE}
                    to="."
                    search={chip.search}
                    replace
                    aria-label={t.removeFilter(chip.label)}
                    className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-sm text-primary hover:bg-primary/20"
                  >
                    {chip.label}
                    <X aria-hidden className="size-3.5" />
                  </Link>
                ))}
                <Button variant="link" size="sm" onClick={clear}>
                  {t.resetAll}
                </Button>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* aria-live: el lector de pantalla anuncia cuántas palabras quedan al filtrar */}
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {t.showing(shown, total)}
            </p>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked={showTranslations} onCheckedChange={setShowTranslations} />
              {es.library.showTranslations}
            </label>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          {filters.fav && favorites.size === 0 ? t.emptyFavorites : t.empty}
        </p>
      ) : (
        <section className="overflow-hidden rounded-2xl border bg-card">
          <table className="block w-full text-left md:table">
            <caption className="sr-only">{t.caption}</caption>
            <thead className="hidden border-b bg-muted/40 text-xs tracking-wider text-muted-foreground uppercase md:table-header-group">
              <tr>
                <th scope="col" className="py-3 pl-6 font-semibold">
                  {t.columns.word}
                </th>
                <th scope="col" className="py-3 font-semibold">
                  {t.columns.level}
                </th>
                <th scope="col" className="py-3 font-semibold">
                  {t.columns.type}
                </th>
                {showTranslations && (
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    {t.columns.spanish}
                  </th>
                )}
                <th scope="col" className="py-3 pr-4 font-semibold">
                  {t.columns.meaning}
                </th>
                <th scope="col" className="py-3 pr-6 text-right font-semibold">
                  <span className="sr-only">{t.columns.action}</span>
                </th>
              </tr>
            </thead>
            {visible.map((g) => {
              const inGroup = filtered.find((f) => f.title === g.title)?.items.length ?? 0;
              return (
                <tbody key={g.title} className="block md:table-row-group">
                  <tr className="block border-b bg-muted/50 md:table-row">
                    <th
                      scope="colgroup"
                      colSpan={columns}
                      className="block px-4 py-3 text-left md:table-cell md:px-6"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-3">
                          <span className="grid size-7 place-items-center rounded-md border border-primary/40 bg-primary/10 text-sm font-bold text-primary">
                            {g.title === "0–9" ? "#" : g.title}
                          </span>
                          <span className="text-sm font-semibold tracking-wider uppercase">
                            {t.letterHeading(g.title)}
                          </span>
                        </span>
                        <span className="font-mono text-xs font-normal text-muted-foreground">
                          {t.results(inGroup)}
                        </span>
                      </span>
                    </th>
                  </tr>
                  {g.items.map((w) => (
                    <WordRow
                      key={w.id}
                      word={w}
                      showEs={showTranslations}
                      favorite={favorites.has(w.id)}
                      filters={filters}
                    />
                  ))}
                </tbody>
              );
            })}
          </table>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4 md:px-6">
            <p className="text-sm text-muted-foreground">
              {t.range((page - 1) * PAGE_SIZE + 1, Math.min(page * PAGE_SIZE, shown), shown)}
            </p>
            {pages > 1 && <Pagination page={page} pages={pages} filters={base} />}
          </div>
        </section>
      )}
    </div>
  );
}
