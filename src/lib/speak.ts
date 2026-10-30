// Lectura en voz alta con la Web Speech API del navegador (sin servidor ni archivos de audio).

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, lang = "en-US"): void {
  if (!canSpeak()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // un poco más lento que lo normal, para quien aprende
  window.speechSynthesis.cancel(); // corta la frase anterior si sigue sonando
  window.speechSynthesis.speak(utterance);
}
