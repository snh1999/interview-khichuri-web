import { ArrowsClockwiseIcon, CheckIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useCallback } from "react";
import {
  GEMINI_VOICES,
  type IGeminiVoice,
  type ISpeechSettings,
  type IVoiceOption,
  PITCH_MAX,
  PITCH_MIN,
  RATE_MAX,
  RATE_MIN,
} from "@/components/interview/live/speech/speech.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Slider } from "@/components/ui/slider.tsx";

interface IGeminiVoiceOptionProps {
  voice: IGeminiVoice;
  selected: boolean;
  onSelect: (voiceId: string) => void;
}

const GeminiVoiceOption = ({
  voice,
  selected,
  onSelect,
}: Readonly<IGeminiVoiceOptionProps>) => {
  const handleClick = () => onSelect(voice.id);

  return (
    <button
      aria-pressed={selected}
      className={cn(
        "rounded-lg border p-2.5 text-left transition-colors",
        selected
          ? "border-primary/60 bg-card ring-1 ring-primary/20"
          : "border-border bg-card hover:bg-muted"
      )}
      onClick={handleClick}
      type="button"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-semibold text-xs">
          {voice.name}
          <span className="font-normal text-muted-foreground">
            {" "}
            ({voice.gender})
          </span>
        </span>
        {selected ? (
          <CheckIcon className="size-3.5 shrink-0 text-primary" />
        ) : null}
      </span>
      <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">
        {voice.description}
      </span>
      <span className="mt-1 block font-mono text-[0.65rem] text-muted-foreground/80">
        Best for: {voice.bestFor}
      </span>
    </button>
  );
};

interface IBrowserVoiceSectionProps {
  voiceURI: string | undefined;
  voices: IVoiceOption[];
  rate: number;
  pitch: number;
  preferLocalVoices: boolean;
  onVoiceURIChange: (value: string | null) => void;
  onRateChange: (value: number | readonly number[]) => void;
  onPitchChange: (value: number | readonly number[]) => void;
  onPreferLocalToggle: () => void;
  onRefreshVoices: () => void;
}

const BrowserVoiceSection = ({
  voiceURI,
  voices,
  rate,
  pitch,
  preferLocalVoices,
  onVoiceURIChange,
  onRateChange,
  onPitchChange,
  onPreferLocalToggle,
  onRefreshVoices,
}: Readonly<IBrowserVoiceSectionProps>) => {
  const selectedVoiceURI =
    voiceURI !== undefined &&
    voices.some((voice) => voice.voiceURI === voiceURI)
      ? voiceURI
      : "system_default";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <span className="font-bold text-md text-muted-foreground">
          Installed browser voice
        </span>
        <div className="flex gap-2">
          <Button
            onClick={onRefreshVoices}
            title="Poll browser voices again"
            variant="outline"
          >
            <ArrowsClockwiseIcon className="size-3.5" />
            Poll
          </Button>
          <Button
            onClick={onPreferLocalToggle}
            variant={preferLocalVoices ? "default" : "outline"}
          >
            {preferLocalVoices ? <CheckIcon className="size-3.5" /> : null}
            Prefer local voices
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="flex justify-between font-semibold text-xs">
            <span className="text-muted-foreground">Speed / Rate</span>
            <span className="text-primary">{rate.toFixed(2)}x</span>
          </span>
          <Slider
            max={RATE_MAX}
            min={RATE_MIN}
            onValueChange={onRateChange}
            step={0.05}
            value={[rate]}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="flex justify-between font-semibold text-xs">
            <span className="text-muted-foreground">Pitch</span>
            <span className="text-primary text-xs">{pitch.toFixed(2)}x</span>
          </span>
          <Slider
            max={PITCH_MAX}
            min={PITCH_MIN}
            onValueChange={onPitchChange}
            step={0.05}
            value={[pitch]}
          />
        </div>
      </div>

      {/*TODO  change select to show label */}
      {voices.length === 0 ? (
        <p className="rounded-lg border border-border bg-muted/40 p-3 text-[0.7rem]">
          No browser voices were detected. Browser mode falls back to Google
          Cloud voice automatically, or install an English speech voice on your
          system.
        </p>
      ) : (
        <Select onValueChange={onVoiceURIChange} value={selectedVoiceURI}>
          <SelectTrigger className="w-full" size="sm">
            <SelectValue placeholder="System default" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger>
            <SelectGroup>
              <SelectItem value="system_default">
                System default (en-US)
              </SelectItem>
              {voices.map((voice) => (
                <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                  {voice.localService ? " · Local" : " · Remote"}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

interface IProps {
  settings: ISpeechSettings;
  updateSettings: (patch: Partial<ISpeechSettings>) => void;
  refreshVoices: () => Promise<void>;
  voices: IVoiceOption[];
}

export const VoiceSection = ({
  settings,
  updateSettings,
  refreshVoices,
  voices,
}: Readonly<IProps>) => {
  const handleGeminiVoiceSelect = useCallback(
    (voiceId: string) => {
      if (GEMINI_VOICES.some((voice) => voice.id === voiceId)) {
        updateSettings({ geminiVoice: voiceId });
      }
    },
    [updateSettings]
  );

  const handleBrowserVoiceChange = useCallback(
    (value: string | null) => {
      const voiceURI =
        value === null || value === "system_default" ? undefined : value;
      updateSettings({ voiceURI });
    },
    [updateSettings]
  );

  const handleRateChange = useCallback(
    (value: number | readonly number[]) => {
      const nextRate = Array.isArray(value) ? value[0] : value;
      updateSettings({ rate: nextRate ?? settings.rate });
    },
    [settings.rate, updateSettings]
  );

  const handlePitchChange = useCallback(
    (value: number | readonly number[]) => {
      const nextPitch = Array.isArray(value) ? value[0] : value;
      updateSettings({ pitch: nextPitch ?? settings.pitch });
    },
    [settings.pitch, updateSettings]
  );

  const handlePreferLocalToggle = useCallback(() => {
    updateSettings({
      preferLocalVoices: !settings.preferLocalVoices,
    });
  }, [settings.preferLocalVoices, updateSettings]);

  if (settings.engine === "browser") {
    return (
      <BrowserVoiceSection
        onPitchChange={handlePitchChange}
        onPreferLocalToggle={handlePreferLocalToggle}
        onRateChange={handleRateChange}
        onRefreshVoices={refreshVoices}
        onVoiceURIChange={handleBrowserVoiceChange}
        voices={voices}
        {...settings}
      />
    );
  }

  if (settings.engine === "google") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
        <span className="font-bold text-md">Google voice persona</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GEMINI_VOICES.map((voice) => (
            <GeminiVoiceOption
              key={voice.id}
              onSelect={handleGeminiVoiceSelect}
              selected={settings.geminiVoice === voice.id}
              voice={voice}
            />
          ))}
        </div>
      </div>
    );
  }
};
