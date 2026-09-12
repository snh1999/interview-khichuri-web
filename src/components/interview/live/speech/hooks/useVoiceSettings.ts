import { useCallback, useEffect, useState } from "react";
import {
  type IDiagnosticLog,
  type IDiagnosticSummary,
  type ISpeechSettings,
  type IVoiceOption,
  speechService,
} from "@/components/interview/live/speech/speech.ts";

export interface IUseVoiceSettingsResult {
  settings: ISpeechSettings;
  voices: IVoiceOption[];
  logs: IDiagnosticLog[];
  summary: IDiagnosticSummary;
  refreshVoices: () => Promise<void>;
  updateSettings: (patch: Partial<ISpeechSettings>) => void;
}

export const useVoiceSettings = (): IUseVoiceSettingsResult => {
  const [settings, setSettings] = useState<ISpeechSettings>(() =>
    speechService.getSettings()
  );
  const [voices, setVoices] = useState<IVoiceOption[]>(() =>
    speechService.getVoiceOptions()
  );
  const [logs, setLogs] = useState<IDiagnosticLog[]>(() =>
    speechService.getLogs()
  );
  const [summary, setSummary] = useState<IDiagnosticSummary>(() =>
    speechService.getDiagnosticsSummary()
  );

  const refresh = useCallback(() => {
    setSettings(speechService.getSettings());
    setVoices(speechService.getVoiceOptions());
    setLogs(speechService.getLogs());
    setSummary(speechService.getDiagnosticsSummary());
  }, []);

  useEffect(() => {
    const unsubscribeLogs = speechService.onDiagnosticLog(refresh);
    const unsubscribeSettings = speechService.onSettingsChange(refresh);
    return () => {
      unsubscribeLogs();
      unsubscribeSettings();
    };
  }, [refresh]);

  const refreshVoices = useCallback(async () => {
    const nextVoices = await speechService.pollVoices();
    setVoices(nextVoices);
    setSummary(speechService.getDiagnosticsSummary());
  }, []);

  const updateSettings = useCallback((patch: Partial<ISpeechSettings>) => {
    speechService.setSettings(patch);
  }, []);

  return { settings, voices, logs, summary, refreshVoices, updateSettings };
};
