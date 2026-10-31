// Verbos irregulares frecuentes (nivel A1–B1). La primera forma es la más común; las
// demás son variantes válidas (británica / estadounidense) que la corrección acepta.

export type IrregularVerb = {
  base: string;
  past: readonly string[];
  participle: readonly string[];
  es: string;
};

const v = (base: string, past: string, participle: string, es: string): IrregularVerb => ({
  base,
  past: past.split("/"),
  participle: participle.split("/"),
  es,
});

export const irregularVerbs: readonly IrregularVerb[] = [
  v("be", "was/were", "been", "ser, estar"),
  v("become", "became", "become", "llegar a ser"),
  v("begin", "began", "begun", "empezar"),
  v("break", "broke", "broken", "romper"),
  v("bring", "brought", "brought", "traer"),
  v("build", "built", "built", "construir"),
  v("buy", "bought", "bought", "comprar"),
  v("catch", "caught", "caught", "atrapar"),
  v("choose", "chose", "chosen", "elegir"),
  v("come", "came", "come", "venir"),
  v("cost", "cost", "cost", "costar"),
  v("cut", "cut", "cut", "cortar"),
  v("do", "did", "done", "hacer"),
  v("draw", "drew", "drawn", "dibujar"),
  v("drink", "drank", "drunk", "beber"),
  v("drive", "drove", "driven", "conducir"),
  v("eat", "ate", "eaten", "comer"),
  v("fall", "fell", "fallen", "caer"),
  v("feel", "felt", "felt", "sentir"),
  v("find", "found", "found", "encontrar"),
  v("fly", "flew", "flown", "volar"),
  v("forget", "forgot", "forgotten/forgot", "olvidar"),
  v("get", "got", "got/gotten", "conseguir, llegar"),
  v("give", "gave", "given", "dar"),
  v("go", "went", "gone", "ir"),
  v("grow", "grew", "grown", "crecer"),
  v("have", "had", "had", "tener"),
  v("hear", "heard", "heard", "oír"),
  v("keep", "kept", "kept", "guardar, mantener"),
  v("know", "knew", "known", "saber, conocer"),
  v("learn", "learnt/learned", "learnt/learned", "aprender"),
  v("leave", "left", "left", "irse, dejar"),
  v("lose", "lost", "lost", "perder"),
  v("make", "made", "made", "hacer, fabricar"),
  v("meet", "met", "met", "conocer, quedar"),
  v("pay", "paid", "paid", "pagar"),
  v("put", "put", "put", "poner"),
  v("read", "read", "read", "leer"),
  v("ride", "rode", "ridden", "montar"),
  v("run", "ran", "run", "correr"),
  v("say", "said", "said", "decir"),
  v("see", "saw", "seen", "ver"),
  v("sell", "sold", "sold", "vender"),
  v("send", "sent", "sent", "enviar"),
  v("sing", "sang", "sung", "cantar"),
  v("sit", "sat", "sat", "sentarse"),
  v("sleep", "slept", "slept", "dormir"),
  v("speak", "spoke", "spoken", "hablar"),
  v("spend", "spent", "spent", "gastar, pasar (tiempo)"),
  v("stand", "stood", "stood", "estar de pie"),
  v("swim", "swam", "swum", "nadar"),
  v("take", "took", "taken", "tomar, llevar"),
  v("teach", "taught", "taught", "enseñar"),
  v("tell", "told", "told", "contar, decir"),
  v("think", "thought", "thought", "pensar"),
  v("understand", "understood", "understood", "entender"),
  v("wake", "woke", "woken", "despertar"),
  v("wear", "wore", "worn", "llevar puesto"),
  v("win", "won", "won", "ganar"),
  v("write", "wrote", "written", "escribir"),
];

export function getIrregularVerb(base: string): IrregularVerb | undefined {
  return irregularVerbs.find((verb) => verb.base === base);
}
