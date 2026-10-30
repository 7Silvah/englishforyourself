import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  errorCorrection,
  fillBlank,
  multipleChoice,
  transform,
  trueFalse,
  wordOrder,
} from "@/test/fixtures";
import { Harness } from "@/test/item-harness";

function lastCall(fn: ReturnType<typeof vi.fn>) {
  return fn.mock.calls.at(-1)?.[0];
}

describe("FillBlank", () => {
  it("tiene un campo por hueco y guarda lo escrito en su posición", async () => {
    const onChange = vi.fn();
    render(<Harness item={fillBlank} onChange={onChange} />);
    expect(screen.getByRole("textbox", { name: "Hueco 1" })).toHaveFocus();
    await userEvent.type(screen.getByRole("textbox", { name: "Hueco 2" }), "visited");
    expect(lastCall(onChange)).toEqual({ type: "fill-blank", values: ["", "visited"] });
  });

  it("marca el hueco incorrecto tras corregir", () => {
    render(<Harness item={fillBlank} result={{ status: "wrong", parts: ["correct", "wrong"] }} />);
    expect(screen.getByRole("textbox", { name: "Hueco 1" })).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("textbox", { name: "Hueco 2" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

describe("MultipleChoice", () => {
  it("guarda el índice original de la opción elegida", async () => {
    const onChange = vi.fn();
    render(<Harness item={multipleChoice} onChange={onChange} />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    await userEvent.click(screen.getByText("drinks"));
    expect(lastCall(onChange)).toEqual({ type: "multiple-choice", choice: 1 });
  });
});

describe("TrueFalse", () => {
  it("responde verdadero o falso", async () => {
    const onChange = vi.fn();
    render(<Harness item={trueFalse} onChange={onChange} />);
    await userEvent.click(screen.getByText("No, tiene un error"));
    expect(lastCall(onChange)).toEqual({ type: "true-false", choice: false });
  });
});

describe("WordOrder", () => {
  it("las fichas pasan a la frase al tocarlas y vuelven al quitarlas", async () => {
    const onChange = vi.fn();
    render(<Harness item={wordOrder} onChange={onChange} />);
    const bank = screen.getByRole("group", { name: "Palabras disponibles" });
    const answer = screen.getByRole("group", { name: "Tu frase" });

    await userEvent.click(within(bank).getByRole("button", { name: "Does" }));
    await userEvent.click(within(bank).getByRole("button", { name: "she" }));
    expect(lastCall(onChange)).toEqual({ type: "word-order", tokens: [0, 1] });
    expect(within(bank).queryByRole("button", { name: "Does" })).not.toBeInTheDocument();

    await userEvent.click(within(answer).getByRole("button", { name: "Quitar «Does»" }));
    expect(lastCall(onChange)).toEqual({ type: "word-order", tokens: [1] });
    expect(within(bank).getByRole("button", { name: "Does" })).toBeInTheDocument();
  });

  it("al tocar una ficha, el foco pasa a la siguiente", async () => {
    render(<Harness item={wordOrder} />);
    const bank = screen.getByRole("group", { name: "Palabras disponibles" });
    const [first, second] = within(bank).getAllByRole("button");
    if (!first || !second) throw new Error("faltan fichas");
    await userEvent.click(first);
    expect(second).toHaveFocus();
  });

  it("funciona con teclado (Tab + Espacio)", async () => {
    const onChange = vi.fn();
    render(<Harness item={wordOrder} onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(lastCall(onChange)).toMatchObject({ type: "word-order" });
    expect(lastCall(onChange)?.tokens).toHaveLength(1);
  });
});

describe("Transform", () => {
  it("muestra la forma pedida y guarda la frase escrita", async () => {
    const onChange = vi.fn();
    render(<Harness item={transform} onChange={onChange} />);
    expect(screen.getByText("negativa")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("textbox"), "She doesn't");
    expect(lastCall(onChange)).toEqual({ type: "transform", text: "She doesn't" });
  });
});

describe("ErrorCorrection", () => {
  it("se elige la palabra incorrecta y se escribe la corrección", async () => {
    const onChange = vi.fn();
    render(<Harness item={errorCorrection} onChange={onChange} />);
    const word = screen.getByRole("button", { name: "don't" });
    await userEvent.click(word);
    expect(word).toHaveAttribute("aria-pressed", "true");
    await userEvent.type(screen.getByRole("textbox"), "doesn't");
    expect(lastCall(onChange)).toEqual({ type: "error-correction", token: 1, text: "doesn't" });
  });
});
