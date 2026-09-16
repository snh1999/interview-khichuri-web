import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryKeys } from "@/api";
import type { IApiKey } from "@/api/keys";
import {
  hasEnglishVoice,
  hydrateVoices,
  isSpeechSynthesisSupported,
  speechService,
  type TSpeechEngine,
} from "@/components/interview/live/speech/speech.ts";
import { api } from "@/lib/api-client.ts";

const fetchActiveGoogleKeys = async (): Promise<IApiKey[]> => {
  const parameters = new URLSearchParams();
  parameters.set("provider", "google");
  parameters.set("isActive", "true");
  return await api.get<IApiKey[]>(`/ai/api-keys?${parameters.toString()}`);
};

export interface IAvatarSpeechAvailability {
  googleAvailable: boolean;
  browserAvailable: boolean;
  supported: boolean;
  engine: TSpeechEngine | "none";
  keysLoaded: boolean;
  voicesChecked: boolean;
}

export const useAvatarSpeechAvailable = (): IAvatarSpeechAvailability => {
  const { data: googleKeys, isPending: keysPending } = useQuery({
    queryKey: queryKeys.keys.list({ provider: "google", isActive: true }),
    queryFn: fetchActiveGoogleKeys,
  });

  const [browserVoices, setBrowserVoices] = useState(
    () => isSpeechSynthesisSupported() && hasEnglishVoice()
  );
  const [browserVoicesChecked, setBrowserVoicesChecked] = useState(
    () => isSpeechSynthesisSupported() && hasEnglishVoice()
  );

  useEffect(() => {
    if (!isSpeechSynthesisSupported()) {
      setBrowserVoices(false);
      setBrowserVoicesChecked(true);
      return;
    }

    let mounted = true;
    const refreshVoices = async () => {
      await hydrateVoices();
      if (mounted) {
        setBrowserVoices(hasEnglishVoice());
        setBrowserVoicesChecked(true);
      }
    };
    refreshVoices();

    return () => {
      mounted = false;
    };
  }, []);

  const googleAvailable = (googleKeys ?? []).length > 0;
  const browserAvailable = browserVoices;
  const keysLoaded = !keysPending;
  const voicesChecked = browserVoicesChecked;
  const supported = googleAvailable || browserAvailable;
  let engine: TSpeechEngine | "none";
  if (googleAvailable) {
    engine = "google";
  } else if (browserAvailable) {
    engine = "browser";
  } else {
    engine = "none";
  }

  useEffect(() => {
    speechService.setEngineAvailability(googleAvailable, browserAvailable);
  }, [googleAvailable, browserAvailable]);

  return {
    googleAvailable,
    browserAvailable,
    supported,
    engine,
    keysLoaded,
    voicesChecked,
  };
};
