import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { speak } from "@/lib/speech";
import {
  categorize,
  dictation,
  listenChoose,
  match,
  tableFill,
  translateBank,
  translateTyped,
} from "@/test/fixtures";
import { Harness } from "@/test/item-harness";
import { ExerciseSession } from "../player/exercise-session";

// La voz del navegador no existe en jsdom: se sustituye por una función espía
vi.mock("@/lib/speech", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/speech")>()),
  speak: vi.fn(),
}));

function lastCall(fn: ReturnType<typeof vi.fn>) {
  return fn.mock.calls.at(-1)?.[0];
}

describe("Match", () => {
  it("cada elemento de la izquierda tiene un desplegable con las opciones", async () => {
    const onChange = vi.fn();
    render(<Harness item={match} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Pareja de «I»" }), "am");
    expect(lastCall(onChange)).toEqual({ type: "match", pairs: [0, null, null] });
  });

  it("marca las parejas incorrectas tras corregir", () => {
    render(
      <Harness item={match} result={{ status: "wrong", parts: ["correct", "wrong", "correct"] }} />,
    );
    expect(screen.getByRole("combobox", { name: "Pareja de «she»" })).toBeDisabled();
  });
});

describe("Categorize", () => {
  it("se toca una palabra y luego el grupo (sin arrastrar)", async () => {
    const onChange = vi.fn();
    render(<Harness item={categorize} onChange={onChange} />);
    const word = screen.getByRole("button", { name: "apple" });
    await userEvent.click(word);
    expect(word).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Colocar «apple» en an" }));
    expect(lastCall(onChange)).toEqual({ type: "categorize", placed: [null, null, 1, null] });
    // Ya colocada: tocarla la devuelve al banco
    await userEvent.click(screen.getByRole("button", { name: "Quitar «apple» de an" }));
    expect(lastCall(onChange)).toEqual({ type: "categorize", placed: [null, null, null, null] });
  });

  it("los botones de colocar están desactivados hasta elegir una palabra", () => {
    render(<Harness item={categorize} />);
    for (const button of screen.getAllByRole("button", { name: "Colocar aquí" }))
      expect(button).toBeDisabled();
  });
});

describe("Translate", () => {
  it("con banco de palabras forma la frase con fichas", async () => {
    const onChange = vi.fn();
    render(<Harness item={translateBank} onChange={onChange} />);
    expect(screen.getByText("Soy profesora.")).toBeInTheDocument();
    const bank = screen.getByRole("group", { name: "Palabras disponibles" });
    await userEvent.click(within(bank).getByRole("button", { name: "I" }));
    expect(lastCall(onChange)).toEqual({ type: "translate", text: "", tokens: [0] });
  });

  it("sin banco se escribe la traducción", async () => {
    const onChange = vi.fn();
    render(<Harness item={translateTyped} onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "I am");
    expect(lastCall(onChange)).toEqual({ type: "translate", text: "I am", tokens: [] });
  });
});

describe("Dictation y ListenChoose", () => {
  it("Escuchar y Más despacio leen la frase a distinta velocidad", async () => {
    render(<Harness item={dictation} />);
    await userEvent.click(screen.getByRole("button", { name: "Escuchar" }));
    expect(speak).toHaveBeenLastCalledWith("Where do you live?");
    await userEvent.click(screen.getByRole("button", { name: "Más despacio" }));
    expect(speak).toHaveBeenLastCalledWith("Where do you live?", { rate: 0.6 });
  });

  it("listen-choose no muestra el texto que hay que escuchar", () => {
    render(<Harness item={listenChoose} />);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Escuchar" })).toBeInTheDocument();
  });
});

describe("TableFill", () => {
  it("cada hueco tiene un nombre con su fila y su columna", async () => {
    const onChange = vi.fn();
    render(<Harness item={tableFill} onChange={onChange} />);
    expect(screen.getByText("She works.")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("textbox", { name: "they, Positive" }), "x");
    expect(lastCall(onChange)).toEqual({ type: "table-fill", values: ["", "x"] });
  });
});

describe("Ítems de audio sin voces", () => {
  function renderSession(items: Parameters<typeof ExerciseSession>[0]["items"]) {
    const rootRoute = createRootRoute({
      component: () => <ExerciseSession setId="s" items={items} mode="practice" />,
    });
    const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory() });
    return render(<RouterProvider router={router} />);
  }

  it("se saltan si el navegador no tiene voces en inglés", async () => {
    renderSession([dictation, match]);
    expect(await screen.findByText("1 de 1")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Pareja de «I»" })).toBeInTheDocument();
  });

  it("si todo el set es de audio, lo explica", async () => {
    renderSession([dictation, listenChoose]);
    expect(await screen.findByText(/no tiene voces en inglés/)).toBeInTheDocument();
  });
});
