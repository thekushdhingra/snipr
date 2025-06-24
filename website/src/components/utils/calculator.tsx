import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { evaluate, format } from "mathjs";

const mobileButtons = [
  ["C", "CE", "(", ")", "√"],
  ["sin", "cos", "tan", "log", "^"],
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"],
];

const desktopButtons = [
  ["7", "8", "9", "/", "sin", "cos"],
  ["4", "5", "6", "*", "tan", "log"],
  ["1", "2", "3", "-", "(", ")"],
  ["0", ".", "^", "+", "√", "="],
  ["C", "CE"],
];

function preprocess(expr: string): string {
  return expr.replace(/√/g, "sqrt").replace(/log/g, "log10");
}

function isValidMath(expression: string): boolean {
  try {
    const prepped = preprocess(expression);
    evaluate(prepped);
    return true;
  } catch {
    return false;
  }
}

export const ScientificCalculator: React.FC<{ searchQuery: string }> = ({
  searchQuery,
}) => {
  const [expression, setExpression] = useState(searchQuery);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-evaluate if searchQuery is given and valid
  useEffect(() => {
    if (searchQuery && isValidMath(searchQuery)) {
      try {
        const prepped = preprocess(searchQuery);
        const evalResult = evaluate(prepped);
        setExpression(format(evalResult, { precision: 14 }));
      } catch {
        setExpression("Error");
      }
    } else {
      setExpression(searchQuery);
    }
  }, [searchQuery]);

  if (!isValidMath(searchQuery)) return null;

  const handleButtonClick = (value: string) => {
    if (value === "C") setExpression("");
    else if (value === "CE") setExpression(expression.slice(0, -1));
    else if (value === "=") {
      try {
        const prepped = preprocess(expression);
        const evalResult = evaluate(prepped);
        setExpression(format(evalResult, { precision: 14 }));
      } catch {
        setExpression("Error");
      }
    } else {
      setExpression(expression === "Error" ? value : expression + value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpression(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      try {
        const prepped = preprocess(expression);
        const evalResult = evaluate(prepped);
        setExpression(format(evalResult, { precision: 14 }));
      } catch {
        setExpression("Error");
      }
    }
  };

  const currentLayout = isMobile ? mobileButtons : desktopButtons;
  const columns = isMobile ? 4 : 6;

  return (
    <div
      style={{
        maxWidth: isMobile ? 360 : 600,
        margin: "0 auto",
        padding: 16,
        borderRadius: 8,
      }}
      className="rounded-2xl p-4 border-accent border-[2px]"
    >
      <h4 className="text-3xl font-bold mb-4">Calculator</h4>
      <Input
        value={expression ?? "0"}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        style={{ marginBottom: 16, fontSize: 20, textAlign: "right" }}
        aria-label="Calculator input"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 8,
        }}
      >
        {currentLayout.flat().map((btn, idx) => (
          <Button
            key={idx}
            variant="outline"
            onClick={() => handleButtonClick(btn)}
            style={{ minWidth: 48, minHeight: 40, fontSize: 16 }}
          >
            {btn}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ScientificCalculator;
