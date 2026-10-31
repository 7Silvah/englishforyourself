// Página de muestra del sistema de diseño: solo existe en desarrollo (/dev/ui).
// Sus textos van sueltos a propósito: no es interfaz para el estudiante.
import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
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

const moods = [
  { key: "pos", label: "✓ Positive", head: "bg-pos text-pos-ink", cell: "bg-pos-soft" },
  { key: "neg", label: "✗ Negative", head: "bg-neg text-neg-ink", cell: "bg-neg-soft" },
  { key: "q", label: "? Question", head: "bg-q text-q-ink", cell: "bg-q-soft" },
  { key: "nq", label: "?✗ Negative question", head: "bg-nq text-nq-ink", cell: "bg-nq-soft" },
] as const;

const moodExamples = [
  "She loves comics",
  "She doesn't love comics",
  "Does she love comics?",
  "Doesn't she love comics?",
];

const blockStyles = {
  subj: "bg-subj border-subj-border text-subj-fg",
  aux: "bg-aux border-aux-border text-aux-fg",
  verb: "bg-verb border-verb-border text-verb-fg",
  obj: "bg-obj border-obj-border text-obj-fg font-normal",
} as const;

function Block({ type, children }: { type: keyof typeof blockStyles; children: ReactNode }) {
  return (
    <span className={cn("rounded-md border-2 px-3 py-1.5 font-semibold", blockStyles[type])}>
      {children}
    </span>
  );
}

const states = [
  {
    key: "correct",
    Icon: CircleCheck,
    title: "¡Correcto!",
    text: "Con he/she/it el verbo lleva -s.",
    className: "bg-correct border-correct-border text-correct-fg",
  },
  {
    key: "almost",
    Icon: CircleAlert,
    title: "Casi: revisa la ortografía",
    text: "Escribiste «travled».",
    className: "bg-almost border-almost-border text-almost-fg",
  },
  {
    key: "wrong",
    Icon: CircleX,
    title: "Incorrecto",
    text: "Después de didn't el verbo va en forma base: go.",
    className: "bg-wrong border-wrong-border text-wrong-fg",
  },
] as const;

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

        <Section title="Modos gramaticales (pos / neg / q / nq)">
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm" lang="en">
              <thead>
                <tr>
                  {moods.map((m) => (
                    <th key={m.key} scope="col" className={cn("px-3 py-2 text-left", m.head)}>
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {moods.map((m, i) => (
                    <td key={m.key} className={cn("px-3 py-2", m.cell)}>
                      {moodExamples[i]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Bloques de estructura">
          <div className="flex flex-wrap items-center gap-2" lang="en">
            <Block type="subj">She</Block>
            <Block type="aux">doesn't</Block>
            <Block type="verb">love</Block>
            <Block type="obj">comics</Block>
          </div>
          <div className="flex flex-wrap items-center gap-2" lang="en">
            <Block type="aux">Does</Block>
            <Block type="subj">she</Block>
            <Block type="verb">love</Block>
            <Block type="obj">comics?</Block>
          </div>
        </Section>

        <Section title="Estados de corrección">
          <div className="grid gap-3 sm:grid-cols-3">
            {states.map(({ key, Icon, title, text, className }) => (
              <div key={key} className={cn("flex gap-3 rounded-lg border p-4", className)}>
                <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm">{text}</p>
                </div>
              </div>
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
