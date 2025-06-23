import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Input } from "./components/ui/input";
import { FaGlobe, FaSearch } from "react-icons/fa";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { TimerWidget, parseTimerQuery } from "./components/utils/timer";
import WordMeaningCard from "./components/utils/word";
import { isCurrencyConversion } from "./searchUtils";

import CurrencyCard from "./components/utils/currency";
import ScientificCalculator from "./components/utils/calculator";
import Stopwatch from "./components/utils/stopwatch";

type SearchResult = {
  id: number;
  name: string;
  description: string;
  url: string;
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchingText, setSearchingText] = useState("Searching...");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const timerSeconds = parseTimerQuery(searchQuery);

  const search = async (query?: string) => {
    setSearching(true);
    try {
      const q = encodeURIComponent(query ?? searchQuery);
      const resp = await fetch(
        `https://snipr-iota.vercel.app/api/search?q=${encodeURIComponent(q)}`
      );
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      const data = await resp.json();
      setSearchResults(data);
      if (data.length === 0) {
        setSearchingText("No results found.");
      }
    } catch (error) {
      setSearchResults([]);
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
      setDarkMode(true);
    } else if (stored === null) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        setDarkMode(true);
        localStorage.setItem("darkMode", "true");
      }
    }
  }, []);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center">
      <div className="fixed top-8 right-8 font-sans scale-150 z-[60]">
        <DarkModeSwitch
          checked={darkMode}
          onChange={(checked: boolean) => {
            if (checked) {
              setDarkMode(true);
            } else {
              setDarkMode(false);
            }
          }}
        />
      </div>
      <h1
        className="font-bold top-4 left-4 cursor-pointer"
        id={searching ? "searching-logo" : "logo"}
        onClick={() => {
          window.location.href = "/";
        }}
        style={{
          fontSize: searching ? "2rem" : "8rem",
          position: searching ? "fixed" : "static",
        }}
      >
        Snipr
      </h1>
      {!searching && <em className="mb-8">The Modern Search Engine</em>}
      <div
        className="flex w-3/4 md:w-1/2 items-center justify-between rounded-lg p-4 shadow-accent border-accent border shadow-2xl flex-row z-50 bg-background relative"
        style={{
          position: searching ? "fixed" : "static",
          top: searching ? "3rem" : "auto",
          left: searching ? "50%" : "auto",
          transform: searching ? "translate(-50%, -50%)" : "none",
        }}
        id="search-bar"
      >
        <div className="w-full relative">
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim() !== "") {
                search();
              }
            }}
            id="search-input"
            placeholder="Type something..."
            autoComplete="off"
          />
        </div>
        <Button
          onClick={() => {
            search();
          }}
          id="search-button"
        >
          <FaSearch />
        </Button>
      </div>
      <div className="pt-24">
        {searching &&
          searchQuery &&
          searchQuery.toLowerCase().includes("timer") && (
            <TimerWidget seconds={timerSeconds || 1} />
          )}
        {searching &&
          searchQuery &&
          searchQuery.toLowerCase().includes("stopwatch") && <Stopwatch />}
        {searching && searchQuery && (
          <>
            <CurrencyCard sText={setSearchingText} searchQuery={searchQuery} />
            <ScientificCalculator searchQuery={searchQuery} />
            <WordMeaningCard searchQuery={searchQuery} />
          </>
        )}
        {searching &&
          searchQuery &&
          searchResults.length === 0 &&
          !isCurrencyConversion(searchingText) &&
          timerSeconds === null && (
            <div className="text-gray-500 text-center">{searchingText}</div>
          )}
        {searchQuery && searchResults.length > 0 && (
          <div className="mt-20">
            <h2 className="px-3 mt-4 text-2xl font-bold mb-4">
              We found the following results:
            </h2>
            <div className="w-full flex flex-col items-center">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="w-full max-w-2xl bg-background p-4 mb-4 rounded-lg shadow-accent border-accent border-[0.1px] shadow-md"
                >
                  <p className="text-md text-gray-500 dark:text-gray-400 flex flex-row items-center gap-2">
                    <FaGlobe />{" "}
                    {result.url.length > 70
                      ? result.url.slice(0, 70) + "..."
                      : result.url}
                  </p>
                  <h3 className="text-xl font-semibold mb-2">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-[#006eff] hover:underline"
                    >
                      {result.name}
                    </a>
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {result.description.length > 100
                      ? result.description.slice(0, 100) + "..."
                      : result.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
