import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { FalseFriendBadge } from "@/components/lesson/false-friend-badge";
import { SpeakButton } from "@/components/lesson/speak-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { LEVELS } from "@/content/levels";
import { useSettingsStore } from "@/features/settings/store";
import { es } from "@/i18n/es";
import { cn } from "@/lib/utils";
import {
  filterGroups,
  firstRows,
  WORD_TYPES,
  type Topic,
  type VocabularyEntry,
  type VocabularyFilters,
  type VocabularyGroup,
} from "./logic";

const t = es.library.vocabularyTable;
const ROUTE = "/biblioteca/$section/";
// Filas que se pintan de golpe: todas (más de 5000) harían lenta la página
const PAGE = 150;

// Un filtro es un enlace: el estado vive en la URL (?nivel=A2&tipo=verb) y se puede compartir
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

function WordRow({
  word,
  showEs,
  filters,
}: {
  word: VocabularyEntry;
  showEs: boolean;
  filters: VocabularyFilters;
}) {
  const meanings = word.meanings ?? [];
  return (
    <tr className="flex flex-col gap-1 border-b px-1 py-3 md:table-row">
      <td className="align-top md:w-52 md:py-3 md:pr-4">
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
      <td className="align-top md:w-16 md:py-3 md:pr-4">
        {word.level && <Badge variant="outline">{word.level}</Badge>}
      </td>
      <td className="align-top text-sm text-muted-foreground md:w-28 md:py-3 md:pr-4">
        {word.pos && t.pos[word.pos]}
      </td>
      {showEs && (
        <td className="align-top md:w-52 md:py-3 md:pr-4">
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
        {word.topics.length > 0 && (
          <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span className="sr-only">{t.topicsOf}:</span>
            {word.topics.map((topic) => (
              <Link
                key={topic.slug}
                from={ROUTE}
                to="."
                search={{ ...filters, tema: topic.slug, letra: undefined }}
                replace
                className="rounded bg-muted px-1.5 py-0.5 hover:text-foreground hover:underline"
              >
                {topic.title}
              </Link>
            ))}
          </p>
        )}
      </td>
    </tr>
  );
}

// <select> nativo y no un menú: 49 temas se eligen bien con el selector del sistema (en el
// móvil, el suyo), y no añade el código del menú de Base UI a la página
function TopicSelect({ topics, filters }: { topics: Topic[]; filters: VocabularyFilters }) {
  const navigate = useNavigate({ from: ROUTE });
  return (
    <label className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
      <span className="w-14">{t.topic}</span>
      <NativeSelect
        size="sm"
        value={filters.tema ?? ""}
        onChange={(e) => {
          const tema = e.target.value;
          void navigate({
            search: { ...filters, tema: tema || undefined, letra: undefined },
            replace: true,
          });
        }}
      >
        <NativeSelectOption value="">{t.allTopics}</NativeSelectOption>
        {topics.map((topic) => (
          <NativeSelectOption key={topic.slug} value={topic.slug}>
            {topic.title}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}

export function VocabularyTable({
  groups,
  topics,
  filters,
}: {
  groups: VocabularyGroup[];
  topics: Topic[];
  filters: VocabularyFilters;
}) {
  const navigate = useNavigate({ from: ROUTE });
  const searchInput = useRef<HTMLInputElement>(null);
  const [limit, setLimit] = useState(PAGE);
  const showTranslations = useSettingsStore((state) => state.showTranslations);
  const setShowTranslations = useSettingsStore((state) => state.setShowTranslations);

  // Filtrar miles de palabras sin tildes en cada tecla no es gratis: solo cuando cambian
  const filtered = useMemo(() => filterGroups(groups, filters), [groups, filters]);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const shown = filtered.reduce((n, g) => n + g.items.length, 0);
  const levels = LEVELS.filter((level) =>
    groups.some((g) => g.items.some((e) => e.level === level)),
  );
  const showEs = showTranslations;
  const isFiltered = Object.values(filters).some(Boolean);

  const visible = firstRows(filtered, limit);

  const clear = () => {
    if (searchInput.current) searchInput.current.value = "";
    void navigate({ search: {}, replace: true });
  };

  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-7">{t.intro}</p>

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

        <div role="group" aria-label={t.level} className="flex flex-wrap items-center gap-1.5">
          <span className="w-14 text-sm font-medium">{t.level}</span>
          <FilterLink search={{ ...filters, nivel: undefined }} active={!filters.nivel}>
            {t.allLevels}
          </FilterLink>
          {levels.map((level) => (
            <FilterLink
              key={level}
              search={{ ...filters, nivel: level }}
              active={filters.nivel === level}
            >
              {level}
            </FilterLink>
          ))}
        </div>

        <TopicSelect topics={topics} filters={filters} />

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
          {groups.map((g) => (
            <FilterLink
              key={g.title}
              search={{ ...filters, letra: g.title, q: undefined }}
              active={filters.letra === g.title}
            >
              {g.title}
            </FilterLink>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* aria-live: el lector de pantalla anuncia cuántas palabras quedan al filtrar */}
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {t.showing(shown, total)}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={clear}>
                {t.clear}
              </Button>
            )}
            <label className="flex items-center gap-2 text-sm font-medium">
              <Switch checked={showTranslations} onCheckedChange={setShowTranslations} />
              {es.library.showTranslations}
            </label>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          {t.empty}
        </p>
      ) : (
        <table className="block w-full text-left md:table">
          <caption className="sr-only">{t.caption}</caption>
          <thead className="hidden border-b text-sm md:table-header-group">
            <tr>
              <th scope="col" className="py-2 pr-4 font-medium">
                {t.columns.word}
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                {t.columns.level}
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
          {visible.map((g) => (
            <tbody key={g.title} className="block md:table-row-group">
              <tr className="block md:table-row">
                <th
                  scope="colgroup"
                  colSpan={showEs ? 5 : 4}
                  className="block bg-muted px-2 py-1 font-heading text-lg font-semibold md:table-cell"
                >
                  {g.title}
                </th>
              </tr>
              {g.items.map((w) => (
                <WordRow key={w.id} word={w} showEs={showEs} filters={filters} />
              ))}
            </tbody>
          ))}
        </table>
      )}

      {shown > limit && (
        <Button variant="outline" className="w-full" onClick={() => setLimit(limit + PAGE)}>
          {t.showMore(Math.min(PAGE, shown - limit))}
        </Button>
      )}
    </div>
  );
}
