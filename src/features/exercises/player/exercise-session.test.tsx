import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { useProgressStore } from "@/features/progress/store";
import { initialProgress } from "@/features/progress/logic";
import { multipleChoice, transform } from "@/test/fixtures";
import { ExerciseSession } from "./exercise-session";

// La pantalla de resultado tiene <Link>, que necesita un router alrededor
function renderWithRouter(ui: ReactNode) {
  const rootRoute = createRootRoute({ component: () => ui });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return render(<RouterProvider router={router} />);
}

const items = [multipleChoice, transform];

beforeEach(() => {
  useProgressStore.setState(initialProgress);
});

describe("ExerciseSession", () => {
  it("modo práctica: corrige cada ítem, deja reintentar el casi y guarda la nota", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ExerciseSession setId="demo" items={items} mode="practice" />);

    expect(await screen.findByText("1 de 2")).toBeInTheDocument();
    await user.click(screen.getByText("drinks"));
    await user.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(screen.getByText("¡Correcto!")).toBeInTheDocument();
    expect(screen.getByText("Con she, el verbo lleva -s.")).toBeInTheDocument();

    // "Siguiente" recibe el foco: Enter pasa al siguiente ítem
    expect(screen.getByRole("button", { name: "Siguiente" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("2 de 2")).toBeInTheDocument();

    const input = screen.getByRole("textbox");
    await user.type(input, "She doesnt work here{Enter}");
    expect(screen.getByText(/Casi/)).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "She does not work here{Enter}");
    expect(screen.getByText("¡Correcto!")).toBeInTheDocument();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("heading", { name: "Resultado" })).toBeInTheDocument();
    expect(screen.getByText("100 %")).toBeInTheDocument();
    expect(useProgressStore.getState().attempts.demo).toMatchObject({ best: 100, count: 1 });
  });

  it("no corrige una respuesta vacía", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ExerciseSession setId="demo" items={items} mode="practice" />);
    await user.click(await screen.findByRole("button", { name: "Comprobar" }));
    expect(screen.getByText(/antes de comprobar/)).toBeInTheDocument();
    expect(screen.queryByText("No es correcto.")).not.toBeInTheDocument();
  });

  it("modo examen: sin corrección hasta el final y repetir solo los fallados", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ExerciseSession setId="demo" items={items} mode="exam" />);

    await user.click(await screen.findByText("drink"));
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.queryByText("No es correcto.")).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "She doesn't work here{Enter}");
    expect(screen.getByText("50 %")).toBeInTheDocument();
    expect(screen.getByText("Para repasar")).toBeInTheDocument();
    expect(useProgressStore.getState().mistakes["demo#mc"]).toMatchObject({ count: 1 });

    await user.click(screen.getByRole("button", { name: "Repetir los fallados" }));
    expect(screen.getByText("1 de 1")).toBeInTheDocument();
    expect(screen.getByText("She ___ coffee every morning.")).toBeInTheDocument();
  });

  it("modo examen: «Anterior» vuelve con la respuesta puesta y se puede cambiar", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ExerciseSession setId="demo" items={items} mode="exam" />);

    // En la primera pregunta no hay «Anterior»
    expect(await screen.findByText("1 de 2")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Anterior" })).not.toBeInTheDocument();

    await user.click(screen.getByText("drink")); // incorrecta
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("2 de 2")).toBeInTheDocument();

    // Vuelve: la opción elegida sigue marcada
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(screen.getByText("1 de 2")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "drink" })).toBeChecked();

    // La cambia por la correcta y termina: cuenta la nueva respuesta
    await user.click(screen.getByText("drinks"));
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await user.type(screen.getByRole("textbox"), "She doesn't work here{Enter}");
    expect(screen.getByText("100 %")).toBeInTheDocument();
  });

  it("modo examen: lo escrito sin enviar no se pierde al volver atrás", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ExerciseSession setId="demo" items={items} mode="exam" />);

    await user.click(await screen.findByText("drinks"));
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    await user.type(screen.getByRole("textbox"), "She doesn't");
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByRole("textbox")).toHaveValue("She doesn't");
  });

  it("modo práctica: no hay «Anterior» (cada respuesta se corrige al momento)", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ExerciseSession setId="demo" items={items} mode="practice" />);

    await user.click(await screen.findByText("drinks"));
    await user.click(screen.getByRole("button", { name: "Comprobar" }));
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByText("2 de 2")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Anterior" })).not.toBeInTheDocument();
  });
});
