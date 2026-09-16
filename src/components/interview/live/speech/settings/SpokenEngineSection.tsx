import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import type { TSpeechEnginePref } from "@/components/interview/live/speech/speech.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ENGINE_ACCENT = {
  google: {
    accent: "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
    chip: "bg-primary/10 text-primary",
    check: "bg-primary",
  },
  browser: {
    accent:
      "border-emerald-600/70 bg-emerald-500/10 ring-1 ring-emerald-600/20",
    chip: "bg-emerald-500/10 text-emerald-700",
    check: "bg-emerald-600",
  },
  auto: {
    accent:
      "border-muted-foreground/40 bg-muted ring-1 ring-muted-foreground/10",
    chip: "bg-muted-foreground/10 text-muted-foreground",
    check: "bg-muted-foreground",
  },
} as const;

interface IEngineOptionCardProps {
  id: "google" | "browser" | "auto";
  title: string;
  highlight: string;
  description: string;
  hint?: string;
  selected: boolean;
  disabled?: boolean;
}

const EngineOptionCard = ({
  id,
  title,
  highlight,
  description,
  hint,
  selected,
  disabled = false,
}: Readonly<IEngineOptionCardProps>) => (
  <Label className="cursor-pointer" htmlFor={id}>
    <Card
      className={cn(
        "flex h-full w-full flex-col transition-colors *:text-xs",
        selected ? "border-2 border-primary bg-primary/10" : "hover:bg-muted",
        disabled && "cursor-not-allowed opacity-50"
      )}
      size="sm"
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-semibold text-md">{title}</CardTitle>
          <RadioGroupItem
            disabled={disabled}
            icon={
              <CheckIcon
                className="size-3 rounded-full text-emerald-500"
                weight="bold"
              />
            }
            id={id}
            value={id}
          />
        </div>
        <CardDescription className={`${ENGINE_ACCENT[id].chip} px-2`}>
          {highlight}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-[0.7rem] text-muted-foreground leading-snug">
        {description}
      </CardContent>
      {hint === undefined ? null : (
        <CardFooter className="text-center text-muted-foreground italic">
          {hint}
        </CardFooter>
      )}
    </Card>
  </Label>
);

interface ISpokenEngineSectionProps {
  engine: TSpeechEnginePref;
  googleAvailable: boolean;
  browserAvailable: boolean;
  voicesCount: number;
  onSelect: (engine: TSpeechEnginePref) => void;
}

export const SpokenEngineSection = ({
  engine,
  googleAvailable,
  browserAvailable,
  voicesCount,
  onSelect,
}: Readonly<ISpokenEngineSectionProps>) => {
  const handleToggle = (v: string) => onSelect(v as TSpeechEnginePref);

  return (
    <div className="flex flex-col gap-3">
      <span className="font-bold text-base">Select spoken voice engine</span>
      <RadioGroup
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        onValueChange={handleToggle}
        value={engine}
      >
        <EngineOptionCard
          description="High-fidelity neural AI voice generated via Google Gemini TTS."
          disabled={!googleAvailable}
          highlight="Universal: Works everywhere"
          hint={
            googleAvailable
              ? "Uses your active Google API key."
              : "Requires an active Google API key."
          }
          id="google"
          selected={engine === "google"}
          title="Google Cloud Neural TTS"
        />
        <EngineOptionCard
          description="Local browser Web Speech API with the voices installed on your OS."
          disabled={!browserAvailable}
          highlight="Lowest latency: Uses OS voices"
          hint={
            browserAvailable
              ? `Uses one of ${voicesCount} detected voices.`
              : "No English browser voices detected."
          }
          id="browser"
          selected={engine === "browser"}
          title="Browser SpeechSynthesis"
        />
        <EngineOptionCard
          description="Automatically pick the best engine, falling back gracefully."
          highlight="Recommended"
          hint="Default: Google Cloud TTS, falls back to browser voice."
          id="auto"
          selected={engine === "auto"}
          title="Auto"
        />
      </RadioGroup>
    </div>
  );
};
