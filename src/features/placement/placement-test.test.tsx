import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlacementItem } from "@/features/exercises/schema";
import { initialProgress } from "@/features/progress/logic";
import { useProgressStore } from "@/features/progress/store";
import { PlacementTest } from "./placement-test";

// El manifiesto real usa import.meta.glob con el plugin de contenido, que no existe en
// Vitest: se sustituye por tres unidades de prueba
const units = [1, 2, 3].map((number) => ({
  slug: `u${number}`,
  meta: { number, titleEs: `Unidad de prueba ${number}`, level: number === 1 ? "A1" : "B1" },
}));
vi.mock("@/content", () => ({
  getUnits: () => units,
  getUnit: (slug: string) => units.find((u) => u.slug === slug),
}));

const question = (n: number): PlacementItem => ({
  id: String(n),
  unit: `u${n}`,
  type: "multiple-choice",
  prompt: `Pregunta ${n}`,
  options: [`bien${n}`, `mal${n}`],
  answer: 0,
});

function renderTest() {
  const items = [question(1), question(2), question(3)];
  const rootRoute = createRootRoute({ component: () => <PlacementTest items={items} /> });
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory() });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => useProgressStore.setState(initialProgress));

describe("PlacementTest", () => {
  it("sin corregir durante la prueba; al final recomienda una unidad y la guarda", async () => {
    const user = userEvent.setup();
    renderTest();

    await user.click(await screen.findByRole("button", { name: "Empezar la prueba" }));
    for (const answer of ["bien1", "mal2", "mal3"]) {
      await user.click(screen.getByText(answer));
      await user.click(screen.getByRole("button", { name: /^(Siguiente|Ver resultado)$/ }));
      expect(screen.queryByText("No es correcto.")).not.toBeInTheDocument();
    }

    expect(
      screen.getByText("Te recomendamos empezar por la unidad 2: Unidad de prueba 2."),
    ).toBeInTheDocument();
    expect(screen.getByText("Empiezas en el nivel B1 · Intermedio I")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir a la unidad: Unidad 2/ })).toBeInTheDocument();
    expect(screen.getByText("1 de 1")).toBeInTheDocument(); // A1
    expect(screen.getByText("0 de 2")).toBeInTheDocument(); // B1
    expect(useProgressStore.getState().placement?.unit).toBe("u2");
  });

  it("se puede repetir desde el principio", async () => {
    const user = userEvent.setup();
    renderTest();
    await user.click(await screen.findByRole("button", { name: "Empezar la prueba" }));
    for (const answer of ["bien1", "bien2", "bien3"]) {
      await user.click(screen.getByText(answer));
      await user.click(screen.getByRole("button", { name: /^(Siguiente|Ver resultado)$/ }));
    }
    expect(screen.getByText(/Has acertado casi todo/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Repetir la prueba" }));
    expect(screen.getByText("Pregunta 1")).toBeInTheDocument();
  });
});
