import { createFileRoute, notFound } from "@tanstack/react-router";
import { getTenseInfo } from "@/content/data/tense-index";
import { IRREGULAR_TOPIC } from "@/content/data/practice-topics";
import { GeneratedPractice } from "@/features/exercises/generated-practice";
import { es } from "@/i18n/es";
import { pageTitle } from "@/lib/page-title";

// Ejercicios generados: /ejercicios/practicar/present-perfect o /ejercicios/practicar/verbos-irregulares
export const Route = createFileRoute("/ejercicios/practicar/$tema")({
  loader: ({ params }) => {
    const tense = getTenseInfo(params.tema);
    if (!tense && params.tema !== IRREGULAR_TOPIC) throw notFound();
    const crumb = es.generated.title(tense ? tense.nameEs : es.generated.irregular.title);
    return { crumb };
  },
  head: ({ loaderData }) => ({ meta: [{ title: pageTitle(loaderData?.crumb) }] }),
  component: PracticePage,
});

function PracticePage() {
  const { tema } = Route.useParams();
  // key: al cambiar de tema, la práctica empieza de cero
  return <GeneratedPractice key={tema} topic={tema} />;
}
