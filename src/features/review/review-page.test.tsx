import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExerciseSet } from "@/features/exercises/schema";
import { initialProgress, mistakeKey } from "@/features/progress/logic";
import { useProgressStore } from "@/features/progress/store";
import { trueFalse } from "@/test/fixtures";
import { ReviewPage } from "./review-page";

const set: ExerciseSet = {
  title: "t",
  titleEs: "Set de prueba",
  instructionEs: "i",
  source: "original",
  level: "A1",
  items: [trueFalse],
};

// El manifiesto real usa import.meta.glob con consultas del plugin de contenido,
// que no existe en Vitest: se sustituye por un set de prueba y sin unidades
vi.mock("@/content", () => ({
  getExerciseSet: (id: string) =>
    id === "prueba" ? { id, meta: set, itemCount: 1, load: async () => set } : undefined,
  getUnits: () => [],
}));

function renderPage() {
  const rootRoute = createRootRoute({ component: ReviewPage });
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory() });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => useProgressStore.setState(initialProgress));

describe("ReviewPage", () => {
  it("sin errores pendientes lo dice y no ofrece repasar", async () => {
    renderPage();
    expect(await screen.findByText(/No tienes errores pendientes/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Repasar/ })).not.toBeInTheDocument();
  });

  it("repasa un error y, al acertarlo, guarda el día del acierto", async () => {
    const key = mistakeKey("prueba", trueFalse.id);
    useProgressStore.setState({
      mistakes: {
        [key]: { setId: "prueba", itemId: trueFalse.id, count: 1, at: "", rightDays: [] },
      },
    });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Repasar 1 ejercicio" }));
    expect(await screen.findByText("Repaso de errores")).toBeInTheDocument();
    await user.click(screen.getByText("No, tiene un error"));
    await user.click(screen.getByRole("button", { name: "Comprobar" }));
    await user.click(screen.getByRole("button", { name: "Ver resultado" }));

    expect(await screen.findByText("100 %")).toBeInTheDocument();
    expect(useProgressStore.getState().mistakes[key]?.rightDays).toHaveLength(1);
    // Un repaso no es un intento del set
    expect(useProgressStore.getState().attempts).toEqual({});
  });
});
