// Lectura en voz alta con la Web Speech API del navegador (sin servidor ni archivos de audio).

export const NORMAL_RATE = 0.9; // un poco más lento que lo normal, para quien aprende
export const SLOW_RATE = 0.6;

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** La mejor voz en inglés disponible: estadounidense, británica o cualquier otra en inglés */
function englishVoice(): SpeechSynthesisVoice | undefined {
  if (!speechSupported()) return undefined;
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("en"));
  return (
    voices.find((v) => v.lang === "en-US") ?? voices.find((v) => v.lang === "en-GB") ?? voices[0]
  );
}

export function hasEnglishVoice(): boolean {
  return englishVoice() !== undefined;
}

/**
 * Avisa cuando cambia la lista de voces. En Chrome, getVoices() está vacía al cargar
 * la página y se llena un poco después (evento "voiceschanged").
 */
export function subscribeVoices(onChange: () => void): () => void {
  if (!speechSupported()) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

export function speak(text: string, { rate = NORMAL_RATE }: { rate?: number } = {}): void {
  if (!speechSupported()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = englishVoice();
  utterance.voice = voice ?? null;
  utterance.lang = voice?.lang ?? "en-US";
  utterance.rate = rate;
  window.speechSynthesis.cancel(); // corta la frase anterior si sigue sonando
  window.speechSynthesis.speak(utterance);
}
