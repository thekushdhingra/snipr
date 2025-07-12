import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

function parseTimerQuery(query?: string): number | null {
  if (!query || typeof query !== "string") return null;

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

  function handleHoursChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 60) val = 60;
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    setSecondsLeft(val * 3600 + m * 60 + s);
    setRunning(false);
    stopAlarm();
  }
  function handleMinutesChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 60) val = 60;
    const h = Math.floor(secondsLeft / 3600);
    const s = secondsLeft % 60;
    setSecondsLeft(h * 3600 + val * 60 + s);
    setRunning(false);
    stopAlarm();
  }
  function handleSecondsChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 60) val = 60;
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    setSecondsLeft(h * 3600 + m * 60 + val);
    setRunning(false);
    stopAlarm();
  }

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="min-w-96 w-full h-full min-h-60 flex items-center justify-center flex-col bg-background p-4 mb-4 rounded-lg border-accent border-[0.1px]">
      <h3 className="text-xl font-semibold mb-2 text-center">Timer</h3>
      <div className="flex gap-2 mb-4 items-center">
        <input
          type="number"
          min={0}
          max={60}
          value={hours ?? 0}
          onChange={handleHoursChange}
          disabled={running}
          className="w-16 text-3xl font-mono text-center border p-2 aspect-square rounded"
          aria-label="Hours"
        />
        <span className="text-3xl font-mono">:</span>
        <input
          type="number"
          min={0}
          max={60}
          value={minutes ?? 0}
          onChange={handleMinutesChange}
          disabled={running}
          className="w-16 text-3xl font-mono text-center border p-2 aspect-square rounded"
          aria-label="Minutes"
        />
        <span className="text-3xl font-mono">:</span>
        <input
          type="number"
          min={0}
          max={60}
          value={seconds ?? 0}
          onChange={handleSecondsChange}
          disabled={running}
          className="w-16 text-3xl font-mono text-center border p-2 aspect-square rounded"
          aria-label="Seconds"
        />
      </div>
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
          Time&apos;s up!
        </div>
      )}
    </div>
  );
}
export { TimerWidget, parseTimerQuery };
