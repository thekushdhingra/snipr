import { getMeanings } from "@/searchUtils";
import { useEffect, useState } from "react";
import TTS from "./tts";

function WordMeaningCard({ searchQuery }: { searchQuery: string }) {
  const [meanings, setMeanings] = useState<string[] | null>(null);

  function cleanQuery(query: string) {
    return query
      .toLowerCase()
      .replace(
        /\b(define|definition|meaning|what is|what's|means|mean|explain|describe|word|of|the)\b/g,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();
  }

  useEffect(() => {
    const fetchMeanings = async () => {
      const cleaned = cleanQuery(searchQuery);
      const result = await getMeanings(cleaned);
      setMeanings(Array.isArray(result) ? result : []);
    };
    fetchMeanings();
  }, [searchQuery]);

  const cleanedWord = cleanQuery(searchQuery);

  if (!meanings || meanings.length === 0) {
    return (
      <div className="min-w-96 w-1/3 h-full min-h-60 flex items-center justify-center flex-col bg-[#ffffff30] dark:bg-[#00000030] backdrop-blur-3xl p-4 mb-4 rounded-lg ">
        <div className="flex flex-col items-center justify-center mb-2">
          <h1 className="text-2xl font-bold mb-4">Text to Speech</h1>
          <div className="flex flex-row items-center justify-center">
            <TTS text={searchQuery} />
            <span className="ml-2 font-medium text-lg">{searchQuery}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-96 w-1/3 h-full min-h-60 flex items-center justify-center flex-col bg-[#ffffff30] dark:bg-[#00000030] backdrop-blur-3xl p-4 mb-4 rounded-lg ">
      <h3 className="text-xl font-semibold mb-2 text-center">Word Meaning</h3>
      <div className="flex items-center justify-center mb-2">
        <TTS text={cleanedWord} />
        <span className="ml-2 font-medium text-lg">{cleanedWord}</span>
      </div>
      <ul id="word-meanings">
        {(meanings ?? []).map((meaning, index) => (
          <li key={index} className="text-gray-700 dark:text-gray-300 mb-1">
            {meaning}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WordMeaningCard;
