import React, { useState, useRef } from "react";
import { Button } from "../ui/button";

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const milliseconds = Math.floor((ms % 1000) / 10)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}.${milliseconds}`;
};

const Stopwatch: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const start = () => {
    if (!running) {
      setRunning(true);
      startTimeRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - (startTimeRef.current || 0));
      }, 10);
    }
  };

  const stop = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
    startTimeRef.current = null;
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="block mx-auto mb-8 text-center border p-10 w-fit rounded">
      <div className="text-3xl mb-4 font-mono">{formatTime(elapsed)}</div>
      <div className="flex gap-2 justify-center">
        <Button onClick={start} disabled={running}>
          Start
        </Button>
        <Button onClick={stop} disabled={!running}>
          Stop
        </Button>
        <Button onClick={reset} disabled={elapsed === 0 && !running}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Stopwatch;
