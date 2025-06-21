import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

function parseTimerQuery(query: string): number | null {
  const match = query
    .toLowerCase()
    .match(/(\d+)\s*(hour|hr|h|min(?:ute)?|sec(?:ond)?|s)?\s*timer/);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (isNaN(value)) return null;
  if (!unit || unit.startsWith("min")) return value * 60;
  if (unit.startsWith("sec") || unit === "s") return value;
  if (unit.startsWith("hour") || unit.startsWith("hr") || unit === "h")
    return value * 3600;
  return null;
}

function TimerWidget({ seconds: initialSeconds }: { seconds: number }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopAlarm();
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          clearInterval(intervalRef.current!);
          playAlarm();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  function playAlarm() {
    stopAlarm();
    const audio = new Audio("/alarm.mp3");
    audio.loop = true;
    audio.play().catch((err) => console.error("Audio play error:", err));
    alarmRef.current = audio;
  }

  function stopAlarm() {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      alarmRef.current = null;
    }
  }

  function formatTime(s: number) {
    const h = Math.floor(s / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((s % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  }

  return (
    <div className="min-w-96 w-full h-full min-h-60 flex items-center justify-center flex-col bg-background p-4 mb-4 rounded-lg shadow-accent border-accent border-[0.1px] shadow-md">
      <h3 className="text-xl font-semibold mb-2 text-center">Timer</h3>
      <div className="text-5xl font-mono mb-4">{formatTime(secondsLeft)}</div>
      <div className="flex gap-2">
        <Button
          onClick={() => setRunning((r) => !r)}
          disabled={secondsLeft === 0}
        >
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          onClick={() => {
            setSecondsLeft(initialSeconds);
            setRunning(false);
            stopAlarm();
          }}
        >
          Reset
        </Button>
      </div>
      {secondsLeft === 0 && (
        <div className="mt-4 text-red-500 font-bold animate-bounce">
          Time's up!
        </div>
      )}
    </div>
  );
}
export { TimerWidget, parseTimerQuery };
