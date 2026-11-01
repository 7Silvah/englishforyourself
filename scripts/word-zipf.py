# Frecuencia de uso (escala Zipf) de las palabras que pide scripts/vocabulary-levels.ts.
# Uso: python scripts/word-zipf.py   (con la librería wordfreq: pip install wordfreq)
# Lee .face2face/zipf-input.json (lista de palabras) y escribe .face2face/zipf.json
# ({palabra: zipf}). Zipf 6 = muy común (the, have); 3 = rara (hedgehog). wordfreq solo
# existe en Python: por eso este paso no es TypeScript como el resto de scripts/.
import json
from pathlib import Path

from wordfreq import tokenize, zipf_frequency

DIR = Path(".face2face")
words = json.loads((DIR / "zipf-input.json").read_text(encoding="utf-8"))


def zipf_of(text: str) -> float:
    """Una expresión es tan difícil como su palabra más rara: «hanging out with friends»
    se entiende si conoces hang, out, with y friends. La frecuencia de la frase entera
    sería mucho más baja que la de cualquiera de sus palabras."""
    tokens = tokenize(text, "en")
    return min((zipf_frequency(t, "en") for t in tokens), default=0.0)


zipf = {w: zipf_of(w) for w in words}
(DIR / "zipf.json").write_text(json.dumps(zipf, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(zipf)} palabras en .face2face/zipf.json")
