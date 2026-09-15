import {
  CheckCircleIcon,
  SpeakerHighIcon,
  TerminalWindowIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useVoiceSettings } from "@/components/interview/live/speech/hooks/useVoiceSettings.ts";
import { AudioTestSection } from "@/components/interview/live/speech/settings/AudioTestSection.tsx";
import { SpokenEngineSection } from "@/components/interview/live/speech/settings/SpokenEngineSection.tsx";
import { VoiceSection } from "@/components/interview/live/speech/settings/VoiceSection.tsx";
import {
  type IDiagnosticLog,
  type IDiagnosticTestResult,
  speechService,
  type TSpeechEnginePref,
} from "@/components/interview/live/speech/speech.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  DrawLog,
  DrawLogBody,
  DrawLogContent,
  DrawLogDescription,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog.tsx";

interface IVoiceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  googleAvailable: boolean;
  browserAvailable: boolean;
  keysLoaded: boolean;
  voicesChecked: boolean;
}

interface ILogConsoleProps {
  logs: IDiagnosticLog[];
  onClear: () => void;
}

const LogConsole = ({ logs, onClear }: Readonly<ILogConsoleProps>) => {
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logs.length === 0) {
      return;
    }
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Card className="flex flex-col gap-2 pb-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 font-semibold text-md">
          <TerminalWindowIcon className="size-3.5" />
          Diagnostic Event Console
        </CardTitle>
        <CardAction>
          <Button onClick={onClear} size="xs" variant="ghost">
            Clear Log
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex h-32 flex-col gap-1 overflow-y-auto bg-secondary/30 p-3 font-mono text-xs">
        {logs.length === 0 ? (
          <span className="text-slate-500 italic">
            No events recorded yet. Click "Speak Audio Test" to inspect.
          </span>
        ) : (
          logs.map((log) => {
            let colorClass = "text-slate-300";
            if (log.type === "success") {
              colorClass = "text-emerald-400";
            } else if (log.type === "warn") {
              colorClass = "text-amber-300";
            } else if (log.type === "error") {
              colorClass = "font-bold text-red-400";
            }
            return (
              <span
                className={cn(
                  "flex items-start gap-2 leading-tight",
                  colorClass
                )}
                key={log.id}
              >
                <span className="shrink-0 select-none text-slate-500">
                  {log.timestamp}
                </span>
                <span>{log.message}</span>
              </span>
            );
          })
        )}
        <div ref={logEndRef} />
      </CardContent>
    </Card>
  );
};

const testTextSample =
  "Welcome to the mock technical interview. Are you ready to begin?";

const formatLatency = (latencyMs: number | undefined): string =>
  latencyMs === undefined ? "Succeeded" : `Succeeded (${latencyMs}ms)`;

export const VoiceSettingsModal = ({
  open,
  onOpenChange,
  googleAvailable,
  browserAvailable,
  keysLoaded,
  voicesChecked,
}: Readonly<IVoiceSettingsModalProps>) => {
  const { settings, voices, logs, summary, refreshVoices, updateSettings } =
    useVoiceSettings();
  const [testText, setTestText] = useState(testTextSample);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingHardware, setIsTestingHardware] = useState(false);
  const [testResult, setTestResult] = useState<IDiagnosticTestResult | null>(
    null
  );
  const stopCounterRef = useRef(0);

  useEffect(() => {
    refreshVoices();
  }, [refreshVoices]);

  useEffect(() => {
    if (!(keysLoaded && voicesChecked)) {
      return;
    }
    if (settings.engine === "google" && !googleAvailable) {
      updateSettings({ engine: "auto" });
    } else if (settings.engine === "browser" && !browserAvailable) {
      updateSettings({ engine: "auto" });
    }
  }, [
    settings.engine,
    googleAvailable,
    browserAvailable,
    keysLoaded,
    voicesChecked,
    updateSettings,
  ]);

  const handleClose = useCallback(() => {
    speechService.stop();
    onOpenChange(false);
  }, [onOpenChange]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        handleClose();
        return;
      }
      onOpenChange(nextOpen);
    },
    [handleClose, onOpenChange]
  );

  const handleEngineSelect = useCallback(
    (engine: TSpeechEnginePref) => {
      updateSettings({ engine });
    },
    [updateSettings]
  );

  const handleTestTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTestText(e.target.value);
    },
    []
  );

  const handleRunDiagnostic = useCallback(async () => {
    if (isTesting) {
      stopCounterRef.current += 1;
      speechService.stop();
      setIsTesting(false);
      return;
    }
    const stopCounterAtStart = stopCounterRef.current;
    setIsTesting(true);
    setTestResult(null);
    const result = await speechService.runDiagnosticTest(testText);
    setIsTesting(false);
    if (stopCounterRef.current === stopCounterAtStart) {
      setTestResult(result);
    }
  }, [isTesting, testText]);

  const handleTestHardware = useCallback(async () => {
    speechService.stop();
    setIsTestingHardware(true);
    try {
      await speechService.playHardwareSoundCheck();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Hardware check failed.";
      setTestResult({
        success: false,
        error: message,
        voicesCount: summary.voicesCount,
      });
    } finally {
      setIsTestingHardware(false);
    }
  }, [summary.voicesCount]);

  const handleResetDefaults = useCallback(() => {
    speechService.stop();
    speechService.resetSettings();
    setTestResult(null);
  }, []);

  const handleClearLogs = useCallback(() => {
    speechService.clearLogs();
  }, []);

  let testBadge: ReactNode = null;
  if (testResult?.success) {
    testBadge = (
      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 font-semibold text-[0.65rem] text-emerald-700">
        <CheckCircleIcon className="size-3" />
        {formatLatency(testResult.latencyMs)}
      </span>
    );
  } else if (testResult) {
    testBadge = (
      <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 font-semibold text-[0.65rem] text-destructive">
        <WarningCircleIcon className="size-3" />
        {`Failed: ${testResult.error ?? "unknown"}`}
      </span>
    );
  }

  return (
    <DrawLog onOpenChange={handleOpenChange} open={open}>
      <DrawLogContent className="gap-0 sm:max-w-[90vw]">
        <DrawLogHeader className="py-4">
          <div className="flex items-center gap-3">
            <SpeakerHighIcon className="size-6" />
            <div className="space-y-0.5">
              <DrawLogTitle className="font-semibold text-base">
                Voice &amp; Speech Settings
              </DrawLogTitle>
              <DrawLogDescription>
                Select the spoken voice engine, interviewer voice, and test
                audio playback.
              </DrawLogDescription>
            </div>
          </div>
        </DrawLogHeader>

        <DrawLogBody className="flex-1 text-foreground text-sm">
          <div className="flex items-center gap-3 rounded-xl bg-primary/20 p-4">
            {summary.voicesCount === 0 ? (
              <div className="space-y-0.5">
                <DrawLogTitle className="text-md">
                  Flatpak / Sandboxed Browser Detected (0 Local Voices)
                </DrawLogTitle>
                <DrawLogDescription className="text-xs">
                  Sandboxed browsers (e.g. Flatpak on Linux) often report
                  <span className="font-mono"> speechSynthesis</span> failures
                  with 0 local voices. Google Cloud voice streams over standard
                  web audio and works reliably everywhere.
                </DrawLogDescription>
              </div>
            ) : null}
          </div>

          <SpokenEngineSection
            browserAvailable={browserAvailable}
            engine={settings.engine}
            googleAvailable={googleAvailable}
            onSelect={handleEngineSelect}
            voicesCount={summary.voicesCount}
          />

          <VoiceSection
            refreshVoices={refreshVoices}
            settings={settings}
            updateSettings={updateSettings}
            voices={voices}
          />

          <AudioTestSection
            engine={settings.engine}
            isTesting={isTesting}
            isTestingHardware={isTestingHardware}
            onResetDefaults={handleResetDefaults}
            onRunDiagnostic={handleRunDiagnostic}
            onTestHardware={handleTestHardware}
            onTestTextChange={handleTestTextChange}
            testBadge={testBadge}
            testText={testText}
          />

          <LogConsole logs={logs} onClear={handleClearLogs} />
        </DrawLogBody>

        <DrawLogFooter className="bg-muted/30 px-5 py-3.5 sm:justify-between">
          <span className="text-[0.7rem] text-muted-foreground">
            Active:{" "}
            <span className="font-semibold text-foreground">
              {summary.activeVoiceName}
            </span>
          </span>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90"
            onClick={handleClose}
          >
            Save &amp; Close
          </Button>
        </DrawLogFooter>
      </DrawLogContent>
    </DrawLog>
  );
};
