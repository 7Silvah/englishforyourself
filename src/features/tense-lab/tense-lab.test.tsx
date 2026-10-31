import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TenseLab } from "./tense-lab";

// TenseLab tiene <Link>, que necesita un router alrededor
async function renderLab(tense: Parameters<typeof TenseLab>[0]["tense"]) {
  const rootRoute = createRootRoute({ component: () => <TenseLab tense={tense} /> });
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory() });
  render(<RouterProvider router={router} />);
  await screen.findByRole("heading", { level: 2, name: /Presente|Pasado|Futuro/ });
}

describe("TenseLab", () => {
  it("muestra estructura y ejemplo del primer sujeto y cambia al elegir otro", async () => {
    await renderLab("present-continuous");
    expect(
      screen.getByRole("heading", { level: 2, name: "Presente continuo" }),
    ).toBeInTheDocument();
    const I = screen.getByRole("button", { name: "I" });
    expect(I).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText("taking")[0]).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "He / She / It" }));
    expect(screen.getByRole("button", { name: "He / She / It" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByText("is not / isn't").length).toBeGreaterThan(0);
  });

  it("con un solo grupo, explica que es igual para todos los sujetos", async () => {
    await renderLab("simple-past");
    expect(screen.getByText(/Igual con todos los sujetos/)).toBeInTheDocument();
  });

  it("el constructor conjuga la frase elegida en las tres formas", async () => {
    await renderLab("present-perfect");
    const builder = screen.getByRole("region", { name: "Construye tu frase" });
    await userEvent.selectOptions(
      within(builder).getByRole("combobox", { name: "Sujeto" }),
      "they",
    );
    const sentences = within(builder)
      .getAllByRole("definition")
      .map((d) => d.textContent?.replace(/(Sujeto|Auxiliar|Verbo|Complemento): /g, ""));
    expect(sentences[0]).toContain("Theyhaveplayedtennis");
  });
});
