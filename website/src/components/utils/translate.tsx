import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import TTS from "./tts";
const LANGUAGES: Record<string, string> = {
  afrikaans: "af",
  albanian: "sq",
  amharic: "am",
  arabic: "ar",
  armenian: "hy",
  assamese: "as",
  aymara: "ay",
  azerbaijani: "az",
  bambara: "bm",
  basque: "eu",
  belarusian: "be",
  bengali: "bn",
  bhojpuri: "bho",
  bosnian: "bs",
  bulgarian: "bg",
  catalan: "ca",
  cebuano: "ceb",
  chichewa: "ny",
  "chinese (simplified)": "zh-CN",
  "chinese (traditional)": "zh-TW",
  corsican: "co",
  croatian: "hr",
  czech: "cs",
  danish: "da",
  dhivehi: "dv",
  dogri: "doi",
  dutch: "nl",
  english: "en",
  esperanto: "eo",
  estonian: "et",
  ewe: "ee",
  filipino: "tl",
  finnish: "fi",
  french: "fr",
  frisian: "fy",
  galician: "gl",
  georgian: "ka",
  german: "de",
  greek: "el",
  guarani: "gn",
  gujarati: "gu",
  "haitian creole": "ht",
  hausa: "ha",
  hawaiian: "haw",
  hebrew: "iw",
  hindi: "hi",
  hmong: "hmn",
  hungarian: "hu",
  icelandic: "is",
  igbo: "ig",
  ilocano: "ilo",
  indonesian: "id",
  irish: "ga",
  italian: "it",
  japanese: "ja",
  javanese: "jw",
  kannada: "kn",
  kazakh: "kk",
  khmer: "km",
  kinyarwanda: "rw",
  konkani: "gom",
  korean: "ko",
  krio: "kri",
  "kurdish (kurmanji)": "ku",
  "kurdish (sorani)": "ckb",
  kyrgyz: "ky",
  lao: "lo",
  latin: "la",
  latvian: "lv",
  lingala: "ln",
  lithuanian: "lt",
  luganda: "lg",
  luxembourgish: "lb",
  macedonian: "mk",
  maithili: "mai",
  malagasy: "mg",
  malay: "ms",
  malayalam: "ml",
  maltese: "mt",
  maori: "mi",
  marathi: "mr",
  "meiteilon (manipuri)": "mni-Mtei",
  mizo: "lus",
  mongolian: "mn",
  myanmar: "my",
  nepali: "ne",
  norwegian: "no",
  "odia (oriya)": "or",
  oromo: "om",
  pashto: "ps",
  persian: "fa",
  polish: "pl",
  portuguese: "pt",
  punjabi: "pa",
  quechua: "qu",
  romanian: "ro",
  russian: "ru",
  samoan: "sm",
  sanskrit: "sa",
  "scots gaelic": "gd",
  sepedi: "nso",
  serbian: "sr",
  sesotho: "st",
  shona: "sn",
  sindhi: "sd",
  sinhala: "si",
  slovak: "sk",
  slovenian: "sl",
  somali: "so",
  spanish: "es",
  sundanese: "su",
  swahili: "sw",
  swedish: "sv",
  tajik: "tg",
  tamil: "ta",
  tatar: "tt",
  telugu: "te",
  thai: "th",
  tigrinya: "ti",
  tsonga: "ts",
  turkish: "tr",
  turkmen: "tk",
  twi: "ak",
  ukrainian: "uk",
  urdu: "ur",
  uyghur: "ug",
  uzbek: "uz",
  vietnamese: "vi",
  welsh: "cy",
  xhosa: "xh",
  yiddish: "yi",
  yoruba: "yo",
  zulu: "zu",
};

const languageOptions = Object.entries(LANGUAGES);

export function Translate() {
  const [from, setFrom] = useState("auto");
  const [to, setTo] = useState("en");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    console.log("Translating text:", text);
    console.log("From:", from, "To:", to);
    if (!text.trim()) {
      console.log("No text to translate.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(
        `https://snipr-iota.vercel.app/api/translate?text=${encodeURIComponent(
          text
        )}&to=${encodeURIComponent(to)}&from=${encodeURIComponent(from)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Translation response:", data);
      setResult(data.translated || "No translation found.");
    } catch (error) {
      console.error("Translation fetch failed:", error);
      setResult("Translation failed.");
    }
    setLoading(false);
  };

  const getLanguageName = (code: string) => {
    if (code === "auto") return "Auto";
    const entry = languageOptions.find(([, c]) => c === code);
    return entry ? entry[0].charAt(0).toUpperCase() + entry[0].slice(1) : code;
  };

  return (
    <div className="space-y-4 max-w-md mx-auto border p-4 rounded">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block mb-1 text-sm font-medium">From</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                {getLanguageName(from)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto w-56">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={from} onValueChange={setFrom}>
                <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
                {languageOptions.map(([name, code]) => (
                  <DropdownMenuRadioItem key={code} value={code}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-sm font-medium">To</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                {getLanguageName(to)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto w-56">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={to} onValueChange={setTo}>
                {languageOptions.map(([name, code]) => (
                  <DropdownMenuRadioItem key={code} value={code}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Input
        placeholder="Enter text to translate"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        className="block mx-auto"
        onClick={handleTranslate}
        disabled={loading || !text.trim()}
      >
        {loading ? "Translating..." : "Translate"}
      </Button>
      {result && (
        <div className="flex flex-row items-center justify-center border rounded p-3 bg-muted text-sm">
          <TTS text={result} />
          {result}
        </div>
      )}
    </div>
  );
}

export default Translate;
