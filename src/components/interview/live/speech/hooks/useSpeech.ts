import { useCallback, useEffect, useState } from "react";
import {
  type ISpeakOptions,
  type ISpeechStatus,
  speechService,
} from "@/components/interview/live/speech/speech.ts";

export const useSpeech = (): ISpeechStatus & {
  speak: (text: string, options?: ISpeakOptions) => Promise<void>;
  prefetch: (text: string, options?: ISpeakOptions) => Promise<void>;
  stop: () => void;
} => {
  const [status, setStatus] = useState<ISpeechStatus>(() =>
    speechService.getStatus()
  );

  useEffect(() => speechService.subscribe(setStatus), []);

  const speak = useCallback(
    (text: string, options?: ISpeakOptions): Promise<void> =>
      speechService.speak(text, options),
    []
  );

  const prefetch = useCallback(
    (text: string, options?: ISpeakOptions): Promise<void> =>
      speechService.prefetch(text, options),
    []
  );

  const stop = useCallback(() => {
    speechService.stop();
  }, []);

  return { ...status, speak, prefetch, stop };
};
