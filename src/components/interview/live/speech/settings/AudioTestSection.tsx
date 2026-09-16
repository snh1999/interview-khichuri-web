import {
  ArrowCounterClockwiseIcon,
  BellIcon,
  PlayIcon,
  SquareIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import type { ReactNode } from "react";
import type { TSpeechEnginePref } from "@/components/interview/live/speech/speech.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

const ENGINE_LABELS: Record<TSpeechEnginePref, string> = {
  auto: "Auto (Cloud or Browser)",
  browser: "Browser SpeechSynthesis",
  google: "Google Cloud Neural TTS",
};

interface IAudioTestSectionProps {
  engine: TSpeechEnginePref;
  testBadge: ReactNode;
  isTesting: boolean;
  isTestingHardware: boolean;
  testText: string;
  onTestTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRunDiagnostic: () => void;
  onTestHardware: () => void;
  onResetDefaults: () => void;
}

const getEngineDotClass = (engine: TSpeechEnginePref): string => {
  if (engine === "google") {
    return "bg-primary";
  }
  if (engine === "browser") {
    return "bg-emerald-500";
  }
  return "bg-muted-foreground";
};

const getSpeakTestButtonClass = (engine: TSpeechEnginePref): string => {
  if (engine === "browser") {
    return "bg-emerald-600 text-white hover:bg-emerald-700";
  }
  if (engine === "auto") {
    return "bg-foreground text-background hover:bg-foreground/90";
  }
  return "bg-primary text-primary-foreground hover:bg-primary/90";
};

export const AudioTestSection = ({
  engine,
  testBadge,
  isTesting,
  isTestingHardware,
  testText,
  onTestTextChange,
  onRunDiagnostic,
  onTestHardware,
  onResetDefaults,
}: Readonly<IAudioTestSectionProps>) => (
  <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 font-bold text-md">
        <span
          className={cn(
            "size-2 animate-pulse rounded-full",
            getEngineDotClass(engine)
          )}
        />
        Audio Test · {ENGINE_LABELS[engine]}
      </span>
      {testBadge}
    </div>
    <Input
      className="text-sm"
      onChange={onTestTextChange}
      placeholder="Enter a sentence to speak…"
      value={testText}
    />
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={onResetDefaults}
          title="Reset to safe Google Cloud defaults"
          variant="destructive"
        >
          <ArrowCounterClockwiseIcon className="size-3.5" />
          Reset Defaults
        </Button>
        <Button
          disabled={isTestingHardware}
          onClick={onTestHardware}
          title="Play a two-tone chime to test your physical sound card"
          variant="secondary"
        >
          <BellIcon className="size-3.5" />
          Test Hardware
        </Button>
      </div>
      <Button
        className={isTesting ? undefined : getSpeakTestButtonClass(engine)}
        onClick={onRunDiagnostic}
        variant={isTesting ? "destructive" : "default"}
      >
        {isTesting ? (
          <SquareIcon className="size-3.5" />
        ) : (
          <PlayIcon className="size-3.5" />
        )}
        {isTesting ? "Stop Audio" : "Speak Test"}
      </Button>
    </div>
  </div>
);
