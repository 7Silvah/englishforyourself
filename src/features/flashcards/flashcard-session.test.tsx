import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { FlashcardSession } from "./flashcard-session";
import { cardKey, type Card } from "./logic";
import { useFlashcardStore } from "./store";

const cards: Card[] = [{ key: cardKey("vocabulary/colours", "Red"), en: "Red", es: "rojo" }];

// La pantalla final tiene <Link>, que necesita un router alrededor
async function renderSession() {
  const rootRoute = createRootRoute({ component: () => <FlashcardSession cards={cards} /> });
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory() });
  render(<RouterProvider router={router} />);
  await screen.findByText("Red");
}

beforeEach(() => useFlashcardStore.setState({ cards: {} }));

describe("FlashcardSession", () => {
  it("Espacio gira la tarjeta y 2 la marca como sabida", async () => {
    const user = userEvent.setup();
    await renderSession();
    expect(screen.queryByText("rojo")).not.toBeInTheDocument();

    await user.keyboard(" ");
    expect(screen.getByText("rojo")).toBeInTheDocument();
    await user.keyboard("2");

    expect(await screen.findByText("¡Sesión terminada!")).toBeInTheDocument();
    expect(useFlashcardStore.getState().cards[cardKey("vocabulary/colours", "Red")]?.box).toBe(2);
  });

  it("si no la sabías, la tarjeta vuelve al final de la sesión", async () => {
    const user = userEvent.setup();
    await renderSession();
    await user.click(screen.getByRole("button", { name: /Mostrar respuesta/ }));
    await user.click(screen.getByRole("button", { name: /No la sabía/ }));
    // Vuelve a salir la misma tarjeta (2 de 2)
    expect(screen.getByText("2 de 2")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
  });

  it("se puede practicar del español al inglés", async () => {
    const user = userEvent.setup();
    await renderSession();
    await user.click(screen.getByRole("button", { name: /Inglés → español/ }));
    expect(screen.getByText("rojo")).toBeInTheDocument();
    expect(screen.queryByText("Red")).not.toBeInTheDocument();
  });
});
