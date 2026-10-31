import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WordList as WordListData } from "@/content/schema";
import { useSettingsStore } from "@/features/settings/store";
import { speak } from "@/lib/speech";
import { Examples } from "./examples";
import { MdxListItem } from "./mdx-list-item";
import { WordList } from "./word-list";

// En jsdom no hay voces: se simula que sí las hay y se espía speak()
vi.mock("@/hooks/use-english-voice", () => ({ useEnglishVoice: () => true }));
vi.mock("@/lib/speech", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/speech")>()),
  speak: vi.fn(),
}));

const list: WordListData = {
  kind: "wordlist",
  title: "Animals",
  groups: [{ items: [{ en: "Hedgehog", es: "Erizo" }, { en: "Owl" }] }],
};

beforeEach(() => useSettingsStore.setState({ showTranslations: true }));

describe("WordList", () => {
  it("muestra las traducciones y permite ocultarlas", async () => {
    render(<WordList list={list} />);
    expect(screen.getByText("Erizo")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: "Mostrar traducciones" }));
    expect(screen.queryByText("Erizo")).not.toBeInTheDocument();
    expect(useSettingsStore.getState().showTranslations).toBe(false);
  });

  it("sin traducciones no muestra el interruptor", () => {
    render(<WordList list={{ ...list, groups: [{ items: [{ en: "Owl" }] }] }} />);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("cada palabra tiene su botón para oírla", async () => {
    render(<WordList list={list} />);
    const buttons = screen.getAllByRole("button", { name: "Escuchar la frase" });
    expect(buttons).toHaveLength(2);
    await userEvent.click(buttons[0] ?? document.body);
    expect(speak).toHaveBeenLastCalledWith("Hedgehog");
  });
});

describe("Examples", () => {
  it("las frases de ejemplo llevan 🔊 y leen su texto", async () => {
    render(
      <Examples>
        <ul>
          <MdxListItem>
            I <strong>went</strong> to Mexico.
          </MdxListItem>
        </ul>
      </Examples>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Escuchar la frase" }));
    expect(speak).toHaveBeenLastCalledWith("I went to Mexico.");
  });

  it("fuera de <Examples> una lista es una lista normal", () => {
    render(
      <ul>
        <MdxListItem>Normal item</MdxListItem>
      </ul>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
