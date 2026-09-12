import { GearSixIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAvatarSpeechAvailable } from "@/components/interview/live/speech/hooks/useAvatarSpeech.ts";
import { useSpeech } from "@/components/interview/live/speech/hooks/useSpeech.ts";
import { useVoiceSettings } from "@/components/interview/live/speech/hooks/useVoiceSettings.ts";
import { VoiceSettingsModal } from "@/components/interview/live/speech/settings/VoiceSettingsModal.tsx";
import type {
  ISpeakOptions,
  TSpeechEngine,
  TSpeechEnginePref,
} from "@/components/interview/live/speech/speech.ts";
import { TalkingHeadAvatar } from "@/components/interview/live/speech/TalkingHeadAvatar";
import { Button } from "@/components/ui/button.tsx";

const resolveEffectiveEngine = (
  preference: TSpeechEnginePref,
  googleAvailable: boolean,
  browserAvailable: boolean,
  fallback: TSpeechEngine | "none"
): TSpeechEngine | "none" => {
  if (preference === "google") {
    return googleAvailable ? "google" : "none";
  }
  if (preference === "browser") {
    return browserAvailable ? "browser" : "none";
  }
  return fallback;
};

interface IAvatarViewProps {
  questionText: string;
  nextQuestionText: string;
}

export const AvatarView = ({
  questionText,
  nextQuestionText,
}: Readonly<IAvatarViewProps>) => {
  const { speaking, viseme, speak, prefetch, stop } = useSpeech();
  const {
    googleAvailable,
    browserAvailable,
    engine: preferredEngine,
    keysLoaded,
    voicesChecked,
  } = useAvatarSpeechAvailable();
  const { settings: speechSettings } = useVoiceSettings();
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);

  useEffect(() => () => stop(), [stop]);

  const effectiveEngine = resolveEffectiveEngine(
    speechSettings.engine,
    googleAvailable,
    browserAvailable,
    preferredEngine
  );

  useEffect(() => {
    if (effectiveEngine !== "google" || nextQuestionText === "") {
      return;
    }
    // biome-ignore lint/complexity/noVoid: TTS pre-warming is intentionally fire-and-forget
    void prefetch(nextQuestionText, {
      engine: "google",
      voice: speechSettings.geminiVoice,
    });
  }, [effectiveEngine, nextQuestionText, prefetch, speechSettings.geminiVoice]);

  const handleTogglePlay = () => {
    if (speaking) {
      stop();
      return;
    }
    if (effectiveEngine === "none") {
      toast.error(
        "No speech engine is available. Add an active Google API key or enable a browser voice, then retry."
      );
      return;
    }
    const speakOptions: ISpeakOptions = { engine: effectiveEngine };
    if (effectiveEngine === "google") {
      speakOptions.voice = speechSettings.geminiVoice;
    }
    // biome-ignore lint/complexity/noVoid: playback is fire-and-forget; interrupts are handled by the service
    void speak(questionText, speakOptions);
  };

  const handleOpenVoiceSettings = () => setVoiceSettingsOpen(true);

  const handleVoiceSettingsOpenChange = (open: boolean) =>
    setVoiceSettingsOpen(open);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-4">
      <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
        <TalkingHeadAvatar
          className="w-full"
          onTogglePlay={handleTogglePlay}
          personaName="AI Interviewer"
          speaking={speaking}
          viseme={viseme}
        >
          <Button
            onClick={handleOpenVoiceSettings}
            size="icon"
            title="Voice settings"
            variant="ghost"
          >
            <GearSixIcon className="size-4" />
          </Button>
        </TalkingHeadAvatar>
      </div>
      {voiceSettingsOpen ? (
        <VoiceSettingsModal
          browserAvailable={browserAvailable}
          googleAvailable={googleAvailable}
          keysLoaded={keysLoaded}
          onOpenChange={handleVoiceSettingsOpenChange}
          open={voiceSettingsOpen}
          voicesChecked={voicesChecked}
        />
      ) : null}
    </div>
  );
};
