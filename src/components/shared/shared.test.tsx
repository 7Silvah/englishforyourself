import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEnglishVoice } from "@/hooks/use-english-voice";
import { speak } from "@/lib/speech";
import { filterChip, segmentedItem } from "./filter-styles";
import { LevelBadge } from "./level-badge";
import { LevelHeading } from "./level-heading";
import { SectionCard } from "./section-card";
import { Segmented } from "./segmented";
import { SpeakButton } from "./speak-button";

// En jsdom no hay voces: se simula si las hay o no, y se espía speak()
vi.mock("@/hooks/use-english-voice", () => ({ useEnglishVoice: vi.fn(() => true) }));
vi.mock("@/lib/speech", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/speech")>()),
  speak: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useEnglishVoice).mockReturnValue(true);
  vi.mocked(speak).mockClear();
});

describe("SpeakButton", () => {
  it("es un botón redondo con nombre accesible que lee el texto", async () => {
    const user = userEvent.setup();
    render(<SpeakButton text="Hello" label="Escuchar «Hello»" />);
    const button = screen.getByRole("button", { name: "Escuchar «Hello»" });
    expect(button).toHaveClass("rounded-full");
    await user.click(button);
    expect(speak).toHaveBeenCalledWith("Hello");
  });

  it("también funciona con el teclado", async () => {
    const user = userEvent.setup();
    render(<SpeakButton text="Hello" />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Escuchar la frase" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(speak).toHaveBeenCalledWith("Hello");
  });

  it("lee el texto en el momento si es una función", async () => {
    const user = userEvent.setup();
    let text = "first";
    render(<SpeakButton text={() => text} />);
    text = "second";
    await user.click(screen.getByRole("button", { name: "Escuchar la frase" }));
    expect(speak).toHaveBeenCalledWith("second");
  });

  it("cambia de tamaño (sm, md, lg)", () => {
    render(
      <>
        <SpeakButton text="a" label="pequeño" size="sm" />
        <SpeakButton text="b" label="mediano" />
        <SpeakButton text="c" label="grande" size="lg" />
      </>,
    );
    expect(screen.getByRole("button", { name: "pequeño" })).toHaveClass("size-7");
    expect(screen.getByRole("button", { name: "mediano" })).toHaveClass("size-8");
    expect(screen.getByRole("button", { name: "grande" })).toHaveClass("size-11");
  });

  it("no aparece si el navegador no tiene voces en inglés", () => {
    vi.mocked(useEnglishVoice).mockReturnValue(false);
    render(<SpeakButton text="Hello" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("LevelBadge y LevelHeading", () => {
  it("el nivel lleva siempre su texto y el color de su nivel", () => {
    render(<LevelBadge level="B1" />);
    const badge = screen.getByText("B1");
    expect(badge).toHaveClass("bg-level-b1", "text-level-b1-fg");
  });

  it("cada nivel tiene su propio color", () => {
    render(
      <>
        <LevelBadge level="A1" />
        <LevelBadge level="C1" />
      </>,
    );
    expect(screen.getByText("A1")).toHaveClass("bg-level-a1");
    expect(screen.getByText("C1")).toHaveClass("bg-level-c1");
  });

  it("LevelHeading se lee como una frase, con espacios entre las piezas", () => {
    const { container } = render(<LevelHeading level="B1" prefix="Estás en el nivel" />);
    expect(container).toHaveTextContent(/^Estás en el nivel B1 Intermedio I$/);
  });

  it("LevelHeading sin inicio de frase: nivel y nombre", () => {
    const { container } = render(<LevelHeading level="A2" />);
    expect(container).toHaveTextContent(/^A2 Fundamentos II$/);
  });
});

describe("Segmented y estilos de filtro", () => {
  it("es un grupo con nombre accesible y sus opciones", () => {
    render(
      <Segmented label="Nivel">
        <button type="button" className={segmentedItem({ active: true })}>
          A1
        </button>
        <button type="button" className={segmentedItem()}>
          A2
        </button>
      </Segmented>,
    );
    const group = screen.getByRole("group", { name: "Nivel" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "A1" })).toHaveClass("bg-primary");
    expect(screen.getByRole("button", { name: "A2" })).not.toHaveClass("bg-primary");
  });

  it("el chip de filtro usa el color primario suave", () => {
    expect(filterChip()).toContain("bg-primary/10");
  });
});

describe("SectionCard", () => {
  it("muestra cabecera, cuerpo y pie en una sección", () => {
    render(
      <SectionCard header="Cabecera" footer="Pie">
        <p>Cuerpo</p>
      </SectionCard>,
    );
    const section = screen.getByText("Cuerpo").closest("section");
    expect(section).toHaveTextContent("CabeceraCuerpoPie");
  });

  it("sin cabecera ni pie solo muestra el cuerpo", () => {
    const { container } = render(
      <SectionCard>
        <p>Solo cuerpo</p>
      </SectionCard>,
    );
    expect(container.querySelectorAll("section > div")).toHaveLength(0);
  });
});
