import { convertCurrency, isCurrencyConversion } from "@/searchUtils";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
function CurrencyCard({
  searchQuery,
  sText,
}: {
  searchQuery: string;
  sText: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [fromSymbol, setFromSymbol] = useState("");
  const [toSymbol, setToSymbol] = useState("");
  const [isUpdatingFrom, setIsUpdatingFrom] = useState(true);

  useEffect(() => {
    const currencyQuery = isCurrencyConversion(searchQuery);
    if (currencyQuery) {
      convertCurrency(currencyQuery)
        .then((res) => {
          const match = res.match(/(.+?)(\d+\.?\d*)\s*=\s*(.+?)(\d+\.?\d*)/);
          if (match) {
            const [, fromSym, fromAmt, toSym, toAmt] = match;
            setFromSymbol(fromSym.trim());
            setToSymbol(toSym.trim());
            setFromValue(fromAmt);
            setToValue(toAmt);
          }
        })
        .catch((err) => {
          console.error("Error converting currency:", err);
          setFromValue("");
          setToValue("");
        });
    }
  }, [searchQuery]);

  useEffect(() => {
    if (fromValue && isUpdatingFrom) {
      const currencyQuery = isCurrencyConversion(
        `${fromSymbol}${fromValue} to ${toSymbol}`
      );
      if (currencyQuery) {
        convertCurrency(currencyQuery)
          .then((res) => {
            const match = res.match(/=\s*(.+?)(\d+\.?\d*)/);
            if (match) {
              setToValue(match[2]);
            }
          })
          .catch((err) => console.error("Update error:", err));
      }
    }
  }, [fromValue]);

  useEffect(() => {
    if (toValue && !isUpdatingFrom) {
      const currencyQuery = isCurrencyConversion(
        `${toSymbol}${toValue} to ${fromSymbol}`
      );
      if (currencyQuery) {
        convertCurrency(currencyQuery)
          .then((res) => {
            const match = res.match(/=\s*(.+?)(\d+\.?\d*)/);
            if (match) {
              setFromValue(match[2]);
            }
          })
          .catch((err) => console.error("Reverse update error:", err));
      }
    }
  }, [toValue]);

  useEffect(() => {
    if (fromValue || toValue) {
      sText("");
    }
  }, [fromValue, toValue, sText]);

  if (!fromSymbol || !toSymbol) return null;

  return (
    <div className="min-w-96 w-full h-full min-h-60 flex items-center justify-center flex-col bg-background p-4 mb-4 rounded-lg shadow-accent border-accent border-[0.1px] shadow-md">
      <h3 className="text-xl font-semibold mb-2 text-center">
        Currency Conversion
      </h3>
      <div className="flex flex-col gap-2 mb-2 w-full">
        <div className="flex items-center border p-2 rounded-md">
          <span className="mr-2 text-lg">{fromSymbol}</span>
          <Input
            className="flex-1 bg-transparent outline-none"
            type="number"
            value={fromValue ?? 0}
            onChange={(e) => {
              setIsUpdatingFrom(true);
              setFromValue(e.target.value);
            }}
            placeholder="From"
          />
        </div>
        <div className="flex items-center border p-2 rounded-md">
          <span className="mr-2 text-lg">{toSymbol}</span>
          <Input
            className="flex-1 bg-transparent outline-none"
            type="number"
            value={toValue ?? 0}
            onChange={(e) => {
              setIsUpdatingFrom(false);
              setToValue(e.target.value);
            }}
            placeholder="To"
          />
        </div>
      </div>
    </div>
  );
}
export default CurrencyCard;
