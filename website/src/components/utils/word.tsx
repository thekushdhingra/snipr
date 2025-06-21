import { getMeanings } from "@/searchUtils";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      setMeanings(await getMeanings(cleaned));
    };
    fetchMeanings();
  }, [searchQuery]);

  return (
    meanings &&
    meanings.length > 0 && (
      <div className="min-w-96 w-full h-full min-h-60 flex items-center justify-center flex-col bg-background p-4 mb-4 rounded-lg shadow-accent border-accent border-[0.1px] shadow-md">
        <h3 className="text-xl font-semibold mb-2 text-center">Word Meaning</h3>
        <ul id="word-meanings">
          {meanings.map((meaning, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300 mb-1">
              {meaning}
            </li>
          ))}
        </ul>
      </div>
    )
  );
}

export default WordMeaningCard;
