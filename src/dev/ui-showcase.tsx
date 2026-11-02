// Página de muestra del sistema de diseño: solo existe en desarrollo (/dev/ui).
// Sus textos van sueltos a propósito: no es interfaz para el estudiante.
import { Volume2, X } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { LEVELS } from "@/content/levels";
import { filterChip, segmentedItem } from "@/components/shared/filter-styles";
import { LevelBadge } from "@/components/shared/level-badge";
import { LevelHeading } from "@/components/shared/level-heading";
import { SectionCard } from "@/components/shared/section-card";
import { Segmented } from "@/components/shared/segmented";
import { SpeakButton } from "@/components/shared/speak-button";
import { Button } from "@/components/ui/button";
import { Formula } from "@/components/lesson/formula";
import { Modes } from "@/components/lesson/modes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toaster } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ExerciseItem } from "@/features/exercises/check";
import { Feedback } from "@/features/exercises/player/feedback";
import type { Piece } from "@/features/tense-lab/conjugate";
import { SentenceBlocks } from "@/features/tense-lab/sentence-blocks";
import { cn } from "@/lib/utils";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

// Una regla del sistema visual (U2): qué es, cuándo, con qué componente, y un ejemplo
// vivo de cómo sí y cómo no
function Rule({
  title,
  when,
  use,
  good,
  bad,
}: {
  title: string;
  when: string;
  use: string;
  good: ReactNode;
  bad: ReactNode;
}) {
  return (
    <SectionCard
      header={
        <span className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-semibold">{title}</span>
          <code className="text-xs text-muted-foreground">{use}</code>
        </span>
      }
    >
      <div className="space-y-3 p-4 md:px-6">
        <p className="text-sm text-muted-foreground">{when}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-correct-border bg-correct p-3">
            <p className="text-xs font-semibold text-correct-fg">✓ Así</p>
            <div className="flex flex-wrap items-center gap-2">{good}</div>
          </div>
          <div className="space-y-2 rounded-lg border border-wrong-border bg-wrong p-3">
            <p className="text-xs font-semibold text-wrong-fg">✗ No así</p>
            <div className="flex flex-wrap items-center gap-2">{bad}</div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={cn("size-8 rounded-md border", className)} />
      <code>{label}</code>
    </div>
  );
}

const surfaces = [
  ["bg-background", "background"],
  ["bg-card", "card"],
  ["bg-muted", "muted"],
  ["bg-popover", "popover"],
  ["bg-border", "border"],
] as const;

const negative: Piece[] = [
  { role: "subj", text: "She" },
  { role: "aux", text: "doesn't" },
  { role: "verb", text: "love" },
  { role: "obj", text: "comics." },
];
const question: Piece[] = [
  { role: "aux", text: "Does" },
  { role: "subj", text: "she" },
  { role: "verb", text: "love" },
  { role: "obj", text: "comics?" },
];

// Un ítem de muestra para ver el aviso de corrección real en sus tres estados
const sampleItem: ExerciseItem = {
  id: "1",
  type: "fill-blank",
  text: "I didn't ___ to school yesterday.",
  blanks: [{ answers: ["go"] }],
  explanationEs: "Después de didn't, el verbo va en forma base: go, no went.",
};
const statuses = ["correct", "almost", "wrong"] as const;

// Toaster y TooltipProvider solo hacen falta aquí: la app no usa avisos ni tooltips,
// así que no se cargan en main.tsx (ahorran peso en la carga inicial).
export function UiShowcase() {
  return (
    <TooltipProvider>
      <Toaster />
      <div className="space-y-12">
        <header>
          <h1 className="font-heading text-2xl font-bold">Sistema de diseño</h1>
          <p className="text-muted-foreground">Tokens y componentes · /dev/ui</p>
        </header>

        <Section title="Reglas">
          <p className="text-sm text-muted-foreground">
            Lo que se repite en varias pantallas se dibuja siempre igual, con src/components/shared
            (fase U2). Si algo no encaja, se amplía el componente compartido en lugar de hacer uno
            propio. Detalle en docs/PLAN.md §9.2.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <Rule
              title="Nivel del MCER"
              use="<LevelBadge /> · <LevelHeading />"
              when="Siempre que se muestre un nivel (A1…C1): en tarjetas, tablas, cabeceras y resultados. Cada nivel tiene su color y siempre lleva el texto."
              good={
                <>
                  <LevelBadge level="B1" />
                  <LevelHeading level="B1" prefix="Estás en el nivel" />
                </>
              }
              bad={
                <>
                  <Badge variant="secondary">B1</Badge>
                  <span className="text-sm">Estás en el nivel B1 · Intermedio I</span>
                </>
              }
            />
            <Rule
              title="Audio"
              use="<SpeakButton size=sm|md|lg />"
              when="Cada texto en inglés que se pueda escuchar. Si el navegador no tiene voces en inglés, el botón no aparece. Si el audio es la acción principal (ejercicios de escucha), botón con texto y el icono en un círculo."
              good={
                <>
                  <SpeakButton text="Hello" size="sm" />
                  <SpeakButton text="Hello" />
                  <SpeakButton text="Hello" size="lg" />
                </>
              }
              bad={
                <Button variant="ghost" size="icon-sm" aria-label="Escuchar (ejemplo incorrecto)">
                  <Volume2 aria-hidden />
                </Button>
              }
            />
            <Rule
              title="Filtros"
              use="<Segmented> + segmentedItem() · filterChip()"
              when="Cualquier lista que se pueda filtrar. Cada opción es un enlace que cambia la URL; los filtros activos salen como chips que se quitan con un clic, con «Restablecer todos» y el recuento."
              good={
                <>
                  <Segmented label="Nivel">
                    <span className={segmentedItem()}>Todos</span>
                    <span className={segmentedItem({ active: true })}>A2</span>
                  </Segmented>
                  <span className={filterChip()}>
                    Nivel: A2 <X aria-hidden />
                  </span>
                </>
              }
              bad={
                <>
                  <span className="rounded-full border px-3 py-1 text-sm">Todos</span>
                  <span className="rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground">
                    A2
                  </span>
                </>
              }
            />
            <Rule
              title="Bloques de contenido"
              use="<SectionCard header footer> · <PageHeader actions>"
              when="Paneles de filtros, tablas y grupos con cabecera o pie. Los botones de la página van a la derecha del título con PageHeader actions."
              good={
                <SectionCard
                  className="w-full"
                  header={<span className="text-sm font-semibold">Cabecera</span>}
                >
                  <p className="p-3 text-sm">Contenido</p>
                </SectionCard>
              }
              bad={<div className="w-full rounded border p-3 text-sm shadow-lg">Caja propia</div>}
            />
          </div>
        </Section>

        <Section title="Marca">
          <div className="flex flex-wrap items-center gap-6">
            <Swatch className="bg-primary" label="primary" />
            <Swatch className="bg-brand" label="brand" />
            <span className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-primary to-brand text-sm font-bold text-white">
                EfY
              </span>
              <span className="font-semibold">English for Yourself</span>
            </span>
          </div>
        </Section>

        <Section title="Superficies">
          <p className="text-sm text-muted-foreground">
            Capas de fondo a zona elevada, separadas por bordes finos en lugar de sombras.
          </p>
          <div className="flex flex-wrap gap-6">
            {surfaces.map(([className, label]) => (
              <Swatch key={label} className={className} label={label} />
            ))}
          </div>
        </Section>

        <Section title="Modos gramaticales (pos / neg / q / nq)">
          <Modes
            pos="She loves comics."
            neg="She doesn't love comics."
            q="Does she love comics?"
            nq="Doesn't she love comics?"
          />
        </Section>

        <Section title="Bloques de estructura">
          <Formula
            parts={["subj:Sujeto", "aux:auxiliar", "verb:verbo base", "obj:complemento"]}
            example={["She", "doesn't", "love", "comics."]}
          />
          <SentenceBlocks pieces={negative} />
          <SentenceBlocks pieces={question} swap />
        </Section>

        <Section title="Componentes compartidos (U2)">
          <p className="text-sm text-muted-foreground">
            src/components/shared: los mismos en toda la app. Niveles con tokens level-a1 …
            level-c1, tonos propios y distintos de los modos gramaticales.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {LEVELS.map((level) => (
              <LevelBadge key={level} level={level} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SpeakButton text="Hello" size="sm" />
            <SpeakButton text="Hello" />
            <SpeakButton text="Hello" size="lg" />
            <span className="text-sm text-muted-foreground">SpeakButton sm · md · lg</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Segmented label="Nivel">
              <button type="button" aria-pressed="false" className={segmentedItem()}>
                Todos
              </button>
              <button type="button" aria-pressed="true" className={segmentedItem({ active: true })}>
                A1
              </button>
              <button type="button" aria-pressed="false" className={segmentedItem()}>
                A2
              </button>
            </Segmented>
            <span className={filterChip()}>
              Nivel: A1 <X aria-hidden />
            </span>
          </div>
          <SectionCard
            header={
              <span className="text-sm font-semibold tracking-wider uppercase">Cabecera</span>
            }
            footer={<span className="text-sm text-muted-foreground">Pie</span>}
          >
            <p className="p-4 md:px-6">SectionCard: cuerpo sin relleno propio.</p>
          </SectionCard>
        </Section>

        <Section title="Estados de corrección">
          <div className="grid gap-3 lg:grid-cols-3">
            {statuses.map((status) => (
              <Feedback key={status} item={sampleItem} result={{ status }} />
            ))}
          </div>
        </Section>

        <Section title="Componentes">
          <div className="flex flex-wrap gap-2">
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Contorno</Button>
            <Button variant="ghost">Fantasma</Button>
            <Button variant="destructive">Destructivo</Button>
            <Button variant="link">Enlace</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>A1</Badge>
            <Badge variant="secondary">Vocabulario</Badge>
            <Badge variant="outline">Worksheet</Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Unidad 3 · El verbo to be</CardTitle>
                <CardDescription>Ser y estar en un solo verbo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={60} />
                <Input placeholder="Escribe tu respuesta…" lang="en" />
                <label className="flex items-center gap-2 text-sm">
                  <Switch defaultChecked /> Mostrar traducciones
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4">
                <Tabs defaultValue="explicacion">
                  <TabsList>
                    <TabsTrigger value="explicacion">Explicación</TabsTrigger>
                    <TabsTrigger value="practica">Práctica</TabsTrigger>
                  </TabsList>
                  <TabsContent value="explicacion" className="pt-2 text-sm">
                    Usamos <em lang="en">am / is / are</em> según el sujeto.
                  </TabsContent>
                  <TabsContent value="practica" className="pt-2 text-sm">
                    Aquí irán los ejercicios.
                  </TabsContent>
                </Tabs>
                <RadioGroup defaultValue="is">
                  {["am", "is", "are"].map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm" lang="en">
                      <RadioGroupItem value={v} /> She {v} happy.
                    </label>
                  ))}
                </RadioGroup>
                <ToggleGroup defaultValue={["pos"]} variant="outline">
                  <ToggleGroupItem value="pos">✓ Afirmativa</ToggleGroupItem>
                  <ToggleGroupItem value="neg">✗ Negativa</ToggleGroupItem>
                  <ToggleGroupItem value="q">? Pregunta</ToggleGroupItem>
                </ToggleGroup>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" />}>Tooltip</TooltipTrigger>
              <TooltipContent>auxiliary = verbo auxiliar</TooltipContent>
            </Tooltip>
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>Diálogo</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Falso amigo: actually</DialogTitle>
                  <DialogDescription>
                    Significa «en realidad», no «actualmente» (currently).
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" />}>Panel lateral</SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                  <SheetDescription>Así se verá la navegación en el móvil.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={() => toast.success("Progreso guardado")}>
              Aviso (toast)
            </Button>
          </div>
        </Section>
      </div>
    </TooltipProvider>
  );
}
