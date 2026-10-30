import type { Word, WordList as WordListData } from "@/content/schema";

function hasDetails(words: Word[]) {
  return words.some((w) => (w.meanings?.length ?? 0) > 0 || w.example);
}

// Palabras sueltas (vocabulario): rejilla compacta
function WordGrid({ words }: { words: Word[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
      {words.map((w) => (
        <li key={w.en} className="border-b border-dashed py-1.5">
          <span lang="en" className="font-medium">
            {w.en}
          </span>
          {w.es && <span className="ml-2 text-sm text-muted-foreground">{w.es}</span>}
        </li>
      ))}
    </ul>
  );
}

// Expresiones con definición (phrasal verbs, idioms): lista de definiciones
function WordDefinitions({ words }: { words: Word[] }) {
  return (
    <dl className="divide-y rounded-lg border">
      {words.map((w) => {
        const meanings = w.meanings ?? [];
        return (
          <div key={w.en} className="px-4 py-3" lang="en">
            <dt className="font-semibold">
              {w.en}
              {w.es && (
                <span lang="es" className="ml-2 text-sm font-normal text-muted-foreground">
                  {w.es}
                </span>
              )}
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
  return (
    <div className="space-y-8">
      {list.introEs && <p className="leading-7">{list.introEs}</p>}
      {list.intro && (
        <p lang="en" className="leading-7 text-muted-foreground">
          {list.intro}
        </p>
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
            <WordDefinitions words={group.items} />
          ) : (
            <WordGrid words={group.items} />
          )}
        </section>
      ))}
    </div>
  );
}
