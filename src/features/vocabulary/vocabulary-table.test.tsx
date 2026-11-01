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
import type { WordList } from "@/content/schema";
import { useSettingsStore } from "@/features/settings/store";
import { speak } from "@/lib/speech";
import { WORD_TYPES, type VocabularyFilters } from "./logic";
import { VocabularyTable } from "./vocabulary-table";

// En jsdom no hay voces: se simula que sí las hay y se espía speak()
vi.mock("@/hooks/use-english-voice", () => ({ useEnglishVoice: () => true }));
vi.mock("@/lib/speech", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/speech")>()),
  speak: vi.fn(),
}));

const list: WordList = {
  kind: "wordlist",
  title: "Starter Vocabulary",
  groups: [
    {
      title: "A",
      items: [
        { en: "apple", es: "manzana", ipa: "ˈæp.l̩", pos: "noun", meanings: ["a round fruit"] },
        { en: "angry", es: "enojado / enfadado", ipa: "ˈæŋ.ɡri", pos: "adjective" },
      ],
    },
    {
      title: "B",
      items: [
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
  ],
};

// La tabla usa <Link> y navigate() de la ruta de la Biblioteca: la misma ruta, en memoria
function renderAt(url: string) {
  const rootRoute = createRootRoute();
  const lessonRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/biblioteca/$section/$",
    validateSearch: (search: Record<string, unknown>): VocabularyFilters => ({
      letra: typeof search.letra === "string" ? search.letra : undefined,
      tipo: WORD_TYPES.find((type) => type === search.tipo),
      q: typeof search.q === "string" && search.q ? search.q : undefined,
    }),
    component: function Page() {
      return <VocabularyTable list={list} filters={lessonRoute.useSearch()} />;
    },
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([lessonRoute]),
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

const BASE = "/biblioteca/vocabulary-by-level/starter-a1";
const rowWords = () =>
  screen
    .queryAllByRole("row")
    .flatMap((row) => within(row).queryAllByRole("cell").slice(0, 1))
    .map((cell) => cell.querySelector("[lang=en]")?.textContent);

beforeEach(() => {
  useSettingsStore.setState({ showTranslations: true });
});

describe("VocabularyTable", () => {
  it("muestra cada palabra con su IPA, su tipo en español y su traducción", async () => {
    renderAt(BASE);
    const row = (await screen.findByText("apple")).closest("tr");
    expect(row).not.toBeNull();
    const cells = within(row as HTMLElement);
    expect(cells.getByText("/ˈæp.l̩/")).toBeInTheDocument();
    expect(cells.getByText("sustantivo")).toBeInTheDocument();
    expect(cells.getByText("manzana")).toBeInTheDocument();
    expect(cells.getByText("a round fruit")).toBeInTheDocument();
    expect(screen.getByText("4 palabras")).toBeInTheDocument();
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

  it("filtra por tipo y por letra desde la URL", async () => {
    const user = userEvent.setup();
    const router = renderAt(BASE);
    const types = await screen.findByRole("group", { name: "Tipo" });
    await user.click(within(types).getByRole("link", { name: "Verbos" }));
    expect(await screen.findByText("1 de 4 palabras")).toBeInTheDocument();
    expect(rowWords()).toEqual(["buy"]);
    expect(router.state.location.search).toEqual({ tipo: "verb" });

    const letters = screen.getByRole("group", { name: "Letra" });
    await user.click(within(letters).getByRole("link", { name: "A" }));
    expect(
      await screen.findByText("Ninguna palabra coincide con estos filtros."),
    ).toBeInTheDocument();
  });

  it("busca en inglés y en español sin tildes, y «Quitar filtros» lo deshace", async () => {
    const user = userEvent.setup();
    renderAt(`${BASE}?letra=B`);
    await user.type(
      await screen.findByRole("searchbox", { name: "Buscar en la lista" }),
      "enfadado",
    );
    expect(await screen.findByText("1 de 4 palabras")).toBeInTheDocument();
    expect(rowWords()).toEqual(["angry"]);

    await user.click(screen.getByRole("button", { name: "Quitar filtros" }));
    expect(await screen.findByText("4 palabras")).toBeInTheDocument();
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
