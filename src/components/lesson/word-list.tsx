import { Switch } from "@/components/ui/switch";
import type { Word, WordList as WordListData } from "@/content/schema";
import { useSettingsStore } from "@/features/settings/store";
import { es } from "@/i18n/es";
import { SpeakButton } from "./speak-button";

function hasDetails(words: Word[]) {
  return words.some((w) => (w.meanings?.length ?? 0) > 0 || w.example);
}

// Palabras sueltas (vocabulario): rejilla compacta, con 🔊 para oír cada palabra
function WordGrid({ words, showEs }: { words: Word[]; showEs: boolean }) {
  return (
    <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
      {words.map((w) => (
        <li key={w.en} className="flex items-center gap-1 border-b border-dashed py-1">
          <span lang="en" className="font-medium">
            {w.en}
          </span>
          {showEs && w.es && <span className="text-sm text-muted-foreground">{w.es}</span>}
          <SpeakButton text={w.en} className="ml-auto size-7" />
        </li>
      ))}
    </ul>
  );
}

// Expresiones con definición (phrasal verbs, idioms): lista de definiciones
function WordDefinitions({ words, showEs }: { words: Word[]; showEs: boolean }) {
  return (
    <dl className="divide-y rounded-lg border">
      {words.map((w) => {
        const meanings = w.meanings ?? [];
        return (
          <div key={w.en} className="px-4 py-3" lang="en">
            <dt className="flex flex-wrap items-center gap-x-2 font-semibold">
              {w.en}
              {showEs && w.es && (
                <span lang="es" className="text-sm font-normal text-muted-foreground">
                  {w.es}
                </span>
              )}
              <SpeakButton text={w.en} className="size-7" />
            </dt>
            {meanings.length === 1 && <dd className="mt-1 text-muted-foreground">{meanings[0]}</dd>}
            {meanings.length > 1 && (
              <dd className="mt-1">
                <ol className="list-decimal space-y-0.5 pl-5 text-muted-foreground">
                  {meanings.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ol>
              </dd>
            )}
            {w.example && <dd className="mt-1 italic">{w.example}</dd>}
          </div>
        );
      })}
    </dl>
  );
}

export function WordList({ list }: { list: WordListData }) {
  const showTranslations = useSettingsStore((state) => state.showTranslations);
  const setShowTranslations = useSettingsStore((state) => state.setShowTranslations);
  // El interruptor solo tiene sentido si la lista tiene alguna traducción
  const hasTranslations = list.groups.some((g) => g.items.some((w) => w.es));

  return (
    <div className="space-y-8">
      {list.introEs && <p className="leading-7">{list.introEs}</p>}
      {list.intro && (
        <p lang="en" className="leading-7 text-muted-foreground">
          {list.intro}
        </p>
      )}
      {hasTranslations && (
        <label className="flex w-fit items-center gap-2 text-sm font-medium">
          <Switch checked={showTranslations} onCheckedChange={setShowTranslations} />
          {es.library.showTranslations}
        </label>
      )}
      {list.groups.map((group, i) => (
        <section key={group.title ?? i} className="space-y-3">
          {group.title && (
            <h2 className="font-heading text-xl font-semibold" lang="en">
              {group.title}
              {group.titleEs && (
                <span lang="es" className="ml-2 text-base font-normal text-muted-foreground">
                  {group.titleEs}
                </span>
              )}
            </h2>
          )}
          {hasDetails(group.items) ? (
            <WordDefinitions words={group.items} showEs={showTranslations} />
          ) : (
            <WordGrid words={group.items} showEs={showTranslations} />
          )}
        </section>
      ))}
    </div>
  );
}
