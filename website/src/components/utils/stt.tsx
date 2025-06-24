import { useEffect, useRef, useState } from "react";
import { FaMicrophone } from "react-icons/fa";
import * as Vosk from "vosk-browser";

type Props = {
  setText: (text: string) => void;
  setListening: (val: boolean) => void;
  listening: boolean;
};

export default function VoskSTT({ setText, setListening, listening }: Props) {
  const [modelReady, setModelReady] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognizerRef = useRef<any>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const modelLoadedRef = useRef(false);

  useEffect(() => {
    const loadModel = async () => {
      if (modelLoadedRef.current) return;

      const model = await Vosk.createModel("/vosk-model.tar.gz");
      const recognizer = new model.KaldiRecognizer(16000);

      recognizer.on("result", (msg: any) => {
        setText(msg.result.text ?? "");
      });

      recognizer.on("partialresult", (msg: any) => {
        setText(msg.partial ?? "");
      });

      recognizerRef.current = recognizer;
      modelLoadedRef.current = true;
      setModelReady(true);
    };

    loadModel();
  }, [setText]);

  useEffect(() => {
    let isCancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (!listening || isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;

        const workletCode = `
          class VoskProcessor extends AudioWorkletProcessor {
            process(inputs) {
              const input = inputs[0];
              if (input && input[0]) {
                const floatArray = input[0];
                const clone = new Float32Array(floatArray.length);
                clone.set(floatArray);
                this.port.postMessage(clone, [clone.buffer]);
              }
              return true;
            }
          }
          registerProcessor('vosk-processor', VoskProcessor);
        `;

        const blob = new Blob([workletCode], {
          type: "application/javascript",
        });
        const url = URL.createObjectURL(blob);
        await audioContext.audioWorklet.addModule(url);

        if (!listening || isCancelled) {
          audioContext.close();
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const workletNode = new AudioWorkletNode(
          audioContext,
          "vosk-processor"
        );
        workletNodeRef.current = workletNode;

        workletNode.port.onmessage = (event: MessageEvent) => {
          try {
            const float32 = new Float32Array(event.data);
            const audioBuffer = audioContext.createBuffer(
              1,
              float32.length,
              audioContext.sampleRate
            );
            audioBuffer.copyToChannel(float32, 0, 0);
            recognizerRef.current?.acceptWaveform(audioBuffer);
          } catch {
            // silent fail
          }
        };

        source.connect(workletNode);
        workletNode.connect(audioContext.destination);
      } catch {
        setListening(false);
      }
    };

    if (listening && modelReady) {
      start();
    }

    return () => {
      isCancelled = true;
      stop();
    };
  }, [listening, modelReady]);

  const stop = () => {
    workletNodeRef.current?.disconnect();
    sourceRef.current?.disconnect();
    workletNodeRef.current = null;
    sourceRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  return (
    <button
      onClick={() => setListening(!listening)}
      style={{
        fontSize: "2rem",
        padding: "0.5rem",
        cursor: "pointer",
        background: "transparent",
        border: "none",
      }}
      aria-label={listening ? "Stop Listening" : "Start Listening"}
    >
      <FaMicrophone color={listening ? "red" : "gray"} />
    </button>
  );
}
