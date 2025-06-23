import React, { useRef, useState } from "react";
import { FiVolume2 } from "react-icons/fi";
import { Button } from "../ui/button";

interface TTSProps {
  text: string;
}

const TTS: React.FC<TTSProps> = ({ text }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const url = `https://snipr-iota.vercel.app/api/tts?text=${encodeURIComponent(
        text
      )}`;
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        onClick={handlePlay}
        className="p-4 rounded-full aspect-square"
        aria-label="Play audio"
        disabled={loading}
      >
        <FiVolume2 />
      </Button>
      <audio ref={audioRef} hidden />
    </div>
  );
};

export default TTS;
