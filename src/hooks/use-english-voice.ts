import { useSyncExternalStore } from "react";
import { hasEnglishVoice, subscribeVoices } from "@/lib/speech";

/**
 * ¿Hay alguna voz en inglés? Las voces son un dato "externo" a React que cambia solo
 * (llegan tarde en algunos navegadores): useSyncExternalStore se suscribe a esos cambios
 * y vuelve a renderizar cuando aparecen.
 */
export function useEnglishVoice(): boolean {
  return useSyncExternalStore(subscribeVoices, hasEnglishVoice, () => false);
}
