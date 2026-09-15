import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { type ReactNode, useEffect, useState } from "react";
import {
  AvatarFace,
  type IPersonaAppearance,
  PERSONA_STYLES,
} from "@/components/interview/live/speech/AvatarFace.tsx";
import type { TViseme } from "@/components/interview/live/speech/speech.ts";
import { Button } from "@/components/ui/button.tsx";

interface IWaveBar {
  id: number;
  value: number;
}

const VISEME_OPENNESS: Record<TViseme, number> = {
  rest: 0,
  aa: 0.9,
  oh: 0.75,
  ee: 0.5,
  mbp: 0.6,
  th: 0.35,
  fv: 0.5,
};

const INITIAL_WAVE_VALUES = [0.2, 0.4, 0.7, 0.5, 0.6, 0.3, 0.5];
const REST_WAVE_VALUES = [0.15, 0.2, 0.25, 0.2, 0.25, 0.2, 0.15];

const createBars = (values: number[]): IWaveBar[] =>
  values.map((value, idx) => ({ id: idx, value }));

const resolvePersona = (personaId: string): IPersonaAppearance => {
  const key =
    Object.keys(PERSONA_STYLES).find((persona) =>
      personaId.toLowerCase().includes(persona)
    ) ?? "default";
  return PERSONA_STYLES[key] ?? PERSONA_STYLES.default;
};

const getMouthMetrics = (
  speaking: boolean,
  viseme: TViseme,
  amplitude: number
): { width: number; height: number } => {
  if (!speaking) {
    return { width: 18, height: 2 };
  }
  const height = Math.min(8, 2 + amplitude * 7);
  let width: number;
  if (viseme === "ee") {
    width = 24;
  } else if (viseme === "oh") {
    width = 14;
  } else {
    width = 18 + amplitude * 4;
  }
  return { width, height };
};
interface ITalkingHeadAvatarProps {
  speaking: boolean;
  viseme?: TViseme;
  className?: string;
  personaId?: string;
  personaName?: string;
  onTogglePlay?: () => void;
  children?: ReactNode;
}
const WaveformBars = ({
  bars,
  active,
}: Readonly<{ bars: IWaveBar[]; active: boolean }>) => (
  <div className="my-2 flex h-5 w-full items-center justify-center gap-1 rounded-lg">
    {bars.map((bar) => (
      <div
        className={`w-1 rounded-full transition-all duration-75 ${
          active ? "bg-blue-400" : "bg-slate-700"
        }`}
        key={bar.id}
        style={{
          height: `${Math.max(4, Math.min(16, bar.value * 16))}px`,
        }}
      />
    ))}
  </div>
);

export const TalkingHeadAvatar = ({
  speaking,
  viseme = "rest",
  className,
  personaId = "default",
  personaName = "AI Interviewer",
  onTogglePlay,
  children,
}: Readonly<ITalkingHeadAvatarProps>) => {
  const [isBlinking, setIsBlinking] = useState(false);

  const effectiveSpeaking = speaking;
  const currentViseme = speaking && viseme !== "rest" ? viseme : "rest";
  const currentAmp = speaking
    ? Math.max(0.3, VISEME_OPENNESS[currentViseme])
    : 0;
  const appearance = resolvePersona(personaId);
  const { width: mouthWidth, height: mouthHeight } = getMouthMetrics(
    effectiveSpeaking,
    currentViseme,
    currentAmp
  );

  useEffect(() => {
    let openTimer: ReturnType<typeof window.setTimeout> | undefined;
    let closeTimer: ReturnType<typeof window.setTimeout> | undefined;
    const cycle = () => {
      setIsBlinking(true);
      closeTimer = window.setTimeout(() => {
        setIsBlinking(false);
        openTimer = window.setTimeout(cycle, 3000 + Math.random() * 2500);
      }, 150);
    };
    openTimer = window.setTimeout(cycle, 3000 + Math.random() * 2500);
    return () => {
      if (openTimer !== undefined) {
        window.clearTimeout(openTimer);
      }
      if (closeTimer !== undefined) {
        window.clearTimeout(closeTimer);
      }
    };
  }, []);

  const [bars, setBars] = useState<IWaveBar[]>(() =>
    createBars(INITIAL_WAVE_VALUES)
  );

  useEffect(() => {
    if (!effectiveSpeaking) {
      setBars((prev) =>
        prev.map((bar, idx) => ({
          id: bar.id,
          value: REST_WAVE_VALUES[idx] ?? 0.2,
        }))
      );
      return;
    }
    const interval = window.setInterval(() => {
      setBars((prev) =>
        prev.map((bar) => ({
          id: bar.id,
          value: 0.2 + Math.random() * 0.7 * currentAmp,
        }))
      );
    }, 85);
    return () => window.clearInterval(interval);
  }, [effectiveSpeaking, currentAmp]);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 select-none flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-xl",
        className
      )}
    >
      {/* Main Video Call Screen */}
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden bg-slate-950">
        <div
          className={`absolute inset-0 bg-linear-to-b ${appearance.accentGradient} opacity-30`}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, #0f172a, #020617)",
          }}
        />

        <AvatarFace
          appearance={appearance}
          effectiveSpeaking={effectiveSpeaking}
          isBlinking={isBlinking}
          mouthHeight={mouthHeight}
          mouthWidth={mouthWidth}
          name={personaName}
        />

        {/* Ambient speaking audio pulse ring */}
        {effectiveSpeaking ? (
          <div className="pointer-events-none absolute inset-0 animate-pulse border-2 border-emerald-400/30" />
        ) : null}

        <div className="absolute top-2 right-2 z-10">{children}</div>

        {/* Floating Play / Pause Control */}
        {onTogglePlay ? (
          <Button
            className={
              "absolute right-2 bottom-2 z-10 cursor-pointer rounded-full"
            }
            onClick={onTogglePlay}
            size="icon"
            title={speaking ? "Pause voice" : "Play voice"}
            variant={speaking ? "secondary" : "default"}
          >
            {speaking ? (
              <PauseIcon weight="fill" />
            ) : (
              <PlayIcon weight="fill" />
            )}
          </Button>
        ) : null}
        <div className="absolute bottom-0 left-1/2 w-1/2 -translate-x-1/2">
          <WaveformBars active={effectiveSpeaking} bars={bars} />
        </div>
      </div>
    </div>
  );
};
