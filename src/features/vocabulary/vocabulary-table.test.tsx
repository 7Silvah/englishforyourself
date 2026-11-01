import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSettingsStore } from "@/features/settings/store";
import { speak } from "@/lib/speech";
import { buildVocabulary, parseFilters, type VocabularySource } from "./logic";
import { VocabularyTable } from "./vocabulary-table";

// En jsdom no hay voces: se simula que sí las hay y se espía speak()
vi.mock("@/hooks/use-english-voice", () => ({ useEnglishVoice: () => true }));
vi.mock("@/lib/speech", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/speech")>()),
  speak: vi.fn(),
}));

const sources: VocabularySource[] = [
  {
    slug: "starter-a1",
    title: "Vocabulario A1 · Starter",
    level: "A1",
    source: "face2face",
    words: [
      { en: "apple", ipa: "ˈæp.l̩", pos: "noun", meanings: ["a round fruit"] },
      { en: "angry", es: "enojado / enfadado", ipa: "ˈæŋ.ɡri", pos: "adjective" },
      {
        en: "billion",
        es: "mil millones",
        pos: "noun",
        falseFriend: "billón",
        note: "No es un billón español.",
      },
      { en: "buy", es: "comprar", pos: "verb", example: "I buy bread every day." },
    ],
  },
  {
    slug: "fruits",
    title: "Frutas",
    words: [
      { en: "Apple", es: "manzana", level: "A1" },
      { en: "Kumquat", es: "kumquat", level: "C1" },
    ],
  },
  { slug: "hobbies", title: "Aficiones", words: [{ en: "Knitting", es: "tejer", level: "C1" }] },
];
const groups = buildVocabulary(sources);
const topics = [
  { slug: "hobbies", title: "Aficiones" },
  { slug: "fruits", title: "Frutas" },
];

// La tabla usa <Link> y navigate() de la página de sección: la misma ruta, en memoria
function renderAt(url: string) {
  const rootRoute = createRootRoute();
  const sectionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/biblioteca/$section/",
    validateSearch: parseFilters,
    component: function Page() {
      return <VocabularyTable groups={groups} topics={topics} filters={sectionRoute.useSearch()} />;
    },
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([sectionRoute]),
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

const BASE = "/biblioteca/vocabulary/";
const rowWords = () =>
  screen
    .queryAllByRole("row")
    .flatMap((row) => within(row).queryAllByRole("cell").slice(0, 1))
    .map((cell) => cell.querySelector("[lang=en]")?.textContent);

beforeEach(() => {
  useSettingsStore.setState({ showTranslations: true });
});

describe("VocabularyTable", () => {
  it("muestra IPA, nivel, tipo en español, traducción y tema de cada palabra", async () => {
    renderAt(BASE);
    const row = (await screen.findByText("apple")).closest("tr");
    expect(row).not.toBeNull();
    const cells = within(row as HTMLElement);
    expect(cells.getByText("/ˈæp.l̩/")).toBeInTheDocument();
    expect(cells.getByText("A1")).toBeInTheDocument();
    expect(cells.getByText("sustantivo")).toBeInTheDocument();
    expect(cells.getByText("manzana")).toBeInTheDocument();
    expect(cells.getByText("a round fruit")).toBeInTheDocument();
    expect(cells.getByRole("link", { name: "Frutas" })).toBeInTheDocument();
    // apple está en el libro y en Frutas: una sola fila
    expect(screen.getByText("6 palabras")).toBeInTheDocument();
  });

  it("marca el falso amigo con texto y muestra la nota", async () => {
    renderAt(BASE);
    expect(await screen.findByText("Falso amigo: no es «billón»")).toBeInTheDocument();
    expect(screen.getByText("No es un billón español.")).toBeInTheDocument();
  });

  it("lee la palabra con el botón 🔊", async () => {
    const user = userEvent.setup();
    renderAt(BASE);
    await user.click(await screen.findByRole("button", { name: "Escuchar «buy»" }));
    expect(speak).toHaveBeenCalledWith("buy");
  });

  it("filtra por nivel y por tipo desde la URL", async () => {
    const user = userEvent.setup();
    const router = renderAt(BASE);
    await user.click(
      within(await screen.findByRole("group", { name: "Nivel" })).getByRole("link", {
        name: "C1",
      }),
    );
    expect(await screen.findByText("2 de 6 palabras")).toBeInTheDocument();
    expect(rowWords()).toEqual(["Knitting", "Kumquat"]);
    expect(router.state.location.search).toEqual({ nivel: "C1" });

    await user.click(
      within(screen.getByRole("group", { name: "Tipo" })).getByRole("link", { name: "Verbos" }),
    );
    expect(
      await screen.findByText("Ninguna palabra coincide con estos filtros."),
    ).toBeInTheDocument();
  });

  it("el tema de una fila filtra la tabla por ese tema", async () => {
    const user = userEvent.setup();
    renderAt(BASE);
    const row = (await screen.findByText("Knitting")).closest("tr") as HTMLElement;
    await user.click(within(row).getByRole("link", { name: "Aficiones" }));
    expect(await screen.findByText("1 de 6 palabras")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Tema" })).toHaveValue("hobbies");
  });

  it("elige el tema en el selector", async () => {
    const user = userEvent.setup();
    const router = renderAt(BASE);
    await user.selectOptions(await screen.findByRole("combobox", { name: "Tema" }), "Frutas");
    expect(await screen.findByText("2 de 6 palabras")).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ tema: "fruits" });
  });

  it("busca sin tildes en todas las letras y «Quitar filtros» lo deshace", async () => {
    const user = userEvent.setup();
    renderAt(`${BASE}?letra=B`);
    await user.type(
      await screen.findByRole("searchbox", { name: "Buscar en la lista" }),
      "enfadado",
    );
    expect(await screen.findByText("1 de 6 palabras")).toBeInTheDocument();
    expect(rowWords()).toEqual(["angry"]);

    await user.click(screen.getByRole("button", { name: "Quitar filtros" }));
    expect(await screen.findByText("6 palabras")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar en la lista" })).toHaveValue("");
  });

  it("oculta la columna Español con el interruptor", async () => {
    const user = userEvent.setup();
    renderAt(BASE);
    expect(await screen.findByRole("columnheader", { name: "Español" })).toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: "Mostrar traducciones" }));
    expect(screen.queryByRole("columnheader", { name: "Español" })).not.toBeInTheDocument();
    expect(screen.queryByText("manzana")).not.toBeInTheDocument();
  });
});
