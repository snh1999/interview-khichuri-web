import { api } from "@/lib/api-client.ts";

export const VISEMES = ["rest", "aa", "ee", "oh", "mbp", "th", "fv"] as const;

export type TViseme = (typeof VISEMES)[number];

export type TSpeechEngine = "google" | "browser";
export type TSpeechEnginePref = "auto" | TSpeechEngine;

export interface ISpeechStatus {
  speaking: boolean;
  engine: TSpeechEngine | "none";
  viseme: TViseme;
  error: string | null;
}

export interface ISpeakOptions {
  engine?: TSpeechEngine;
  voice?: string;
}

export interface IVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
}

export interface IGeminiVoice {
  id: string;
  name: string;
  gender: string;
  description: string;
  bestFor: string;
}

export const GEMINI_VOICES: readonly IGeminiVoice[] = [
  {
    id: "Kore",
    name: "Kore",
    gender: "Female",
    description: "Crisp, articulate, polished executive tone",
    bestFor: "Elena Rostova, Sarah Lin, Hiring Managers",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "Male",
    description: "Deep, commanding, authoritative technical tone",
    bestFor: "Marcus Vance, Systems Architects, Bar Raisers",
  },
  {
    id: "Zephyr",
    name: "Zephyr",
    gender: "Male",
    description: "Warm, conversational, natural tech tone",
    bestFor: "David Chen, Maya Patel, Peer Engineers",
  },
  {
    id: "Puck",
    name: "Puck",
    gender: "Neutral/Energetic",
    description: "Fast-paced, agile, modern tone",
    bestFor: "Startup Founders, Fast-Paced Screeners",
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "Male",
    description: "Measured, contemplative, analytical tone",
    bestFor: "Principal Researchers, Algorithm Experts",
  },
];

export const RATE_MIN = 0.75;
export const RATE_MAX = 1.4;
export const PITCH_MIN = 0.8;
export const PITCH_MAX = 1.25;

export interface ISpeechSettings {
  engine: TSpeechEnginePref;
  geminiVoice: string;
  voiceURI: string | undefined;
  rate: number;
  pitch: number;
  preferLocalVoices: boolean;
}

export type TDiagnosticLogType = "info" | "success" | "warn" | "error";

export interface IDiagnosticLog {
  id: string;
  timestamp: string;
  type: TDiagnosticLogType;
  message: string;
}

export interface IDiagnosticSummary {
  voicesCount: number;
  activeVoiceName: string;
}

export interface IDiagnosticTestResult {
  success: boolean;
  error?: string;
  latencyMs?: number;
  voicesCount: number;
}

type TGoogleChunkResult = "played" | "network" | "playback";

const GOOGLE_TTS_ENDPOINT = "/ai/tts";
const GOOGLE_TTS_DEFAULT_VOICE = "Kore";
const SPEECH_CHAR_LIMIT = 1200;
const TTS_CACHE_MAX_ENTRIES = 4;
const VISEME_INTERVAL_MS = 110;
const SETTINGS_STORAGE_KEY = "interview-speech-settings";
const LEGACY_ENGINE_STORAGE_KEY = "interview-speech-engine";
const DIAGNOSTIC_TIMEOUT_MS = 45_000;
const SETTINGS_PERSIST_DEBOUNCE_MS = 300;

const TALKING_VISEMES: readonly TViseme[] = [
  "aa",
  "ee",
  "oh",
  "mbp",
  "fv",
  "th",
  "aa",
  "ee",
  "oh",
  "mbp",
];

const DEFAULT_SPEECH_SETTINGS: ISpeechSettings = {
  engine: "auto",
  geminiVoice: GOOGLE_TTS_DEFAULT_VOICE,
  voiceURI: undefined,
  rate: 1,
  pitch: 1,
  preferLocalVoices: true,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const isEnginePref = (value: unknown): value is TSpeechEnginePref =>
  value === "auto" || value === "google" || value === "browser";

const loadSettings = (): ISpeechSettings => {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ISpeechSettings>;
      const geminiVoice = GEMINI_VOICES.some(
        (voice) => voice.id === parsed.geminiVoice
      )
        ? (parsed.geminiVoice ?? DEFAULT_SPEECH_SETTINGS.geminiVoice)
        : DEFAULT_SPEECH_SETTINGS.geminiVoice;
      return {
        engine: isEnginePref(parsed.engine)
          ? parsed.engine
          : DEFAULT_SPEECH_SETTINGS.engine,
        geminiVoice,
        voiceURI:
          typeof parsed.voiceURI === "string"
            ? parsed.voiceURI
            : DEFAULT_SPEECH_SETTINGS.voiceURI,
        rate:
          typeof parsed.rate === "number"
            ? clamp(parsed.rate, RATE_MIN, RATE_MAX)
            : DEFAULT_SPEECH_SETTINGS.rate,
        pitch:
          typeof parsed.pitch === "number"
            ? clamp(parsed.pitch, PITCH_MIN, PITCH_MAX)
            : DEFAULT_SPEECH_SETTINGS.pitch,
        preferLocalVoices:
          typeof parsed.preferLocalVoices === "boolean"
            ? parsed.preferLocalVoices
            : DEFAULT_SPEECH_SETTINGS.preferLocalVoices,
      };
    }
  } catch {
    // ignore storage access errors
  }

  try {
    const legacyEngine = window.localStorage.getItem(LEGACY_ENGINE_STORAGE_KEY);
    if (isEnginePref(legacyEngine)) {
      return { ...DEFAULT_SPEECH_SETTINGS, engine: legacyEngine };
    }
  } catch {
    // ignore storage access errors
  }

  return { ...DEFAULT_SPEECH_SETTINGS };
};

const stripMarkdownForSpeech = (text: string): string =>
  text
    .replace(/```[\s\S]*?```/g, "Code snippet omitted. ")
    .replace(/`([^`]*)`/g, "$1 ")
    .replace(/[*_~#>|]/g, " ")
    .replace(/\[([^\]]*)\]\([^)"]*\)/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();

const SENTENCE_SPLIT_REGEX = /(?<=[.!?¡¿…。！？])\s+/;

const splitSpeechText = (text: string, maxLength: number): string[] => {
  const normalized = text.trim();
  if (normalized.length === 0) {
    return [];
  }
  if (normalized.length <= maxLength) {
    return [normalized];
  }

  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    if (current.trim().length > 0) {
      chunks.push(current.trim());
    }
    current = "";
  };

  for (const rawSentence of normalized.split(SENTENCE_SPLIT_REGEX)) {
    let sentence = rawSentence.trim();
    while (sentence.length > maxLength) {
      flush();
      const cutAt = sentence.lastIndexOf(" ", maxLength);
      const boundary = cutAt > 0 ? cutAt : maxLength;
      chunks.push(sentence.slice(0, boundary).trim());
      sentence = sentence.slice(boundary).trim();
    }
    if (
      current.length > 0 &&
      current.length + sentence.length + 1 > maxLength
    ) {
      flush();
    }
    current = current.length > 0 ? `${current} ${sentence}` : sentence;
  }
  flush();

  return chunks;
};

export const isSpeechSynthesisSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export const getEnglishVoice = (): SpeechSynthesisVoice | undefined => {
  if (!isSpeechSynthesisSupported()) {
    return;
  }
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(
      (voice) =>
        voice.lang.toLowerCase().startsWith("en") &&
        (voice.name.toLowerCase().includes("natural") ||
          voice.name.toLowerCase().includes("enhanced")) &&
        !voice.name.includes("Google")
    ) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
};

export const hasEnglishVoice = (): boolean =>
  isSpeechSynthesisSupported() &&
  window.speechSynthesis
    .getVoices()
    .some((voice) => voice.lang.toLowerCase().startsWith("en"));

export const hydrateVoices = (): Promise<void> =>
  new Promise((resolve) => {
    if (!isSpeechSynthesisSupported() || hasEnglishVoice()) {
      resolve();
      return;
    }
    const handleChange = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleChange);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", handleChange);
  });

const DEFAULT_STATUS: ISpeechStatus = {
  speaking: false,
  engine: "none",
  viseme: "rest",
  error: null,
};

class SpeechService {
  private status: ISpeechStatus = { ...DEFAULT_STATUS };
  private readonly listeners = new Set<(status: ISpeechStatus) => void>();
  private readonly settingsListeners = new Set<() => void>();
  private readonly logListeners = new Set<() => void>();
  private readonly logs: IDiagnosticLog[] = [];
  private readonly googleAudioCache = new Map<string, string>();
  private readonly googlePrefetchInFlight = new Set<string>();
  private audio: HTMLAudioElement | null = null;
  private visemeTimer: ReturnType<typeof window.setInterval> | null = null;
  private visemeIndex = 0;
  private speakToken = 0;
  private settings: ISpeechSettings = loadSettings();
  private googleAvailable: boolean;
  private browserAvailable: boolean;
  private persistTimer: ReturnType<typeof window.setTimeout> | null = null;
  private chunkPlaybackResolver: (() => void) | null = null;

  constructor() {
    this.googleAvailable = false;
    this.browserAvailable = false;
  }

  getStatus(): ISpeechStatus {
    return this.status;
  }

  subscribe(listener: (status: ISpeechStatus) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSettings(): ISpeechSettings {
    return this.settings;
  }

  setSettings(patch: Partial<ISpeechSettings>): void {
    this.settings = {
      ...this.settings,
      ...patch,
      rate:
        patch.rate === undefined
          ? this.settings.rate
          : clamp(patch.rate, RATE_MIN, RATE_MAX),
      pitch:
        patch.pitch === undefined
          ? this.settings.pitch
          : clamp(patch.pitch, PITCH_MIN, PITCH_MAX),
    };
    this.schedulePersist();
    this.emitSettingsChange();
  }

  resetSettings(): void {
    if (this.persistTimer !== null) {
      window.clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    this.settings = { ...DEFAULT_SPEECH_SETTINGS };
    this.persistSettings();
    this.emitSettingsChange();
  }

  setEngineAvailability(google: boolean, browser: boolean): void {
    this.googleAvailable = google;
    this.browserAvailable = browser;
  }

  getVoiceOptions(): IVoiceOption[] {
    if (!isSpeechSynthesisSupported()) {
      return [];
    }
    return window.speechSynthesis
      .getVoices()
      .map((voice) => ({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService === true,
      }))
      .sort((a, b) => {
        if (
          this.settings.preferLocalVoices &&
          a.localService !== b.localService
        ) {
          return a.localService ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  }

  async pollVoices(): Promise<IVoiceOption[]> {
    await hydrateVoices();
    return this.getVoiceOptions();
  }

  getDiagnosticsSummary(): IDiagnosticSummary {
    const voicesCount = this.getVoiceOptions().length;
    const engine = this.resolveEngine();
    let activeVoiceName: string;
    if (engine === "browser") {
      const selectedVoice = this.settings.voiceURI
        ? window.speechSynthesis
            .getVoices()
            .find((voice) => voice.voiceURI === this.settings.voiceURI)
        : undefined;
      activeVoiceName =
        selectedVoice?.name ??
        getEnglishVoice()?.name ??
        "System default (en-US)";
    } else if (engine === "google") {
      const geminiVoice = GEMINI_VOICES.find(
        (voice) => voice.id === this.settings.geminiVoice
      );
      activeVoiceName = geminiVoice?.name ?? this.settings.geminiVoice;
    } else {
      activeVoiceName = "No engine available";
    }
    return { voicesCount, activeVoiceName };
  }

  getLogs(): IDiagnosticLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs.length = 0;
    this.emitLogChange();
  }

  onDiagnosticLog(listener: () => void): () => void {
    this.logListeners.add(listener);
    return () => {
      this.logListeners.delete(listener);
    };
  }

  onSettingsChange(listener: () => void): () => void {
    this.settingsListeners.add(listener);
    return () => {
      this.settingsListeners.delete(listener);
    };
  }

  stop(): void {
    this.speakToken += 1;
    this.clearVisemeLoop();
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.chunkPlaybackResolver?.();
    this.chunkPlaybackResolver = null;
    this.setStatus({ ...DEFAULT_STATUS });
  }

  async speak(text: string, options: ISpeakOptions = {}): Promise<void> {
    this.stop();

    const clean = stripMarkdownForSpeech(text);
    if (clean.length === 0) {
      return;
    }

    const engine = options.engine ?? this.resolveEngine();
    if (engine === "none") {
      return;
    }
    const token = this.speakToken;

    if (engine === "google") {
      await this.speakWithGoogle(
        clean,
        options.voice ?? this.settings.geminiVoice,
        token
      );
    } else if (engine === "browser") {
      if (!isSpeechSynthesisSupported()) {
        this.setStatus({
          speaking: false,
          engine: "none",
          viseme: "rest",
          error: "Speech synthesis is not supported in this browser.",
        });
        return;
      }
      this.speakWithBrowser(clean, token);
    }
  }

  async prefetch(text: string, options: ISpeakOptions = {}): Promise<void> {
    const engine = options.engine ?? this.resolveEngine();
    if (engine !== "google") {
      return;
    }
    const voice = options.voice ?? this.settings.geminiVoice;
    const clean = stripMarkdownForSpeech(text);
    if (clean.length === 0) {
      return;
    }
    const [firstChunk] = splitSpeechText(clean, SPEECH_CHAR_LIMIT);
    if (firstChunk === undefined) {
      return;
    }
    const key = `${voice}:${firstChunk}`;
    if (
      this.googleAudioCache.has(key) ||
      this.googlePrefetchInFlight.has(key)
    ) {
      return;
    }
    this.googlePrefetchInFlight.add(key);
    try {
      const result = await api.post<{ audio: string }>(
        GOOGLE_TTS_ENDPOINT,
        { text: firstChunk, voice },
        { timeoutMs: 30_000 }
      );
      this.cacheGoogleAudio(key, result.audio);
    } catch {
      // pre-warming is best-effort; a failed prefetch is simply retried by speak
    } finally {
      this.googlePrefetchInFlight.delete(key);
    }
  }

  async runDiagnosticTest(text: string): Promise<IDiagnosticTestResult> {
    this.stop();
    const voicesCount = this.getVoiceOptions().length;
    const engine = this.resolveEngine();
    const engineLabel =
      engine === "google" ? "Google Cloud TTS" : "browser speech synthesis";
    const rawText = stripMarkdownForSpeech(text).slice(0, SPEECH_CHAR_LIMIT);

    if (engine === "none") {
      this.log("error", "No speech engine is available for the audio test.");
      return {
        success: false,
        error: "No speech engine available.",
        voicesCount,
      };
    }

    if (rawText.length === 0) {
      this.log("error", "Diagnostic test failed: the text is empty.");
      return { success: false, error: "Test text is empty.", voicesCount };
    }

    this.log("info", `Starting audio test with ${engineLabel}…`);
    const startedAt = performance.now();

    return await new Promise((resolve) => {
      let started = false;
      let latencyMs = 0;
      let finished = false;
      let emits = 0;
      let tokenAfterStart = this.speakToken;

      const timer = window.setTimeout(() => {
        if (finished) {
          return;
        }
        finished = true;
        this.stop();
        this.log("warn", "Diagnostic test timed out.");
        resolve({ success: false, error: "Test timed out.", voicesCount });
      }, DIAGNOSTIC_TIMEOUT_MS);

      const unsubscribe = this.subscribe((status) => {
        if (finished) {
          return;
        }
        emits += 1;
        // TODO: fragile — this skips exactly one emission, assuming the first status
        // update after speak() is the internal stop() reset. Any additional early
        // emission in speak()/stop() desynchronizes latency detection. Replace the
        // counter with an explicit started/settled state machine on the service.
        if (emits <= 1) {
          return;
        }
        if (status.speaking && !started) {
          started = true;
          latencyMs = Math.round(performance.now() - startedAt);
        }
        if (status.speaking) {
          return;
        }
        finished = true;
        if (status.error) {
          window.clearTimeout(timer);
          unsubscribe();
          this.log("error", `Diagnostic test failed: ${status.error}`);
          resolve({ success: false, error: status.error, voicesCount });
          return;
        }
        if (started && this.speakToken === tokenAfterStart) {
          window.clearTimeout(timer);
          unsubscribe();
          this.log(
            "success",
            `Audio test succeeded in ${latencyMs}ms (${voicesCount} browser voices detected).`
          );
          resolve({ success: true, latencyMs, voicesCount });
          return;
        }
        this.resolveDiagnosticStopped(resolve, unsubscribe, timer, voicesCount);
      });

      this.speak(rawText, { engine });
      tokenAfterStart = this.speakToken;
    });
  }

  async playHardwareSoundCheck(): Promise<void> {
    const AudioContextClass =
      window.AudioContext ??
      (
        window as Window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      this.log("error", "Web Audio API is not available in this browser.");
      throw new Error("Web Audio API is not available.");
    }

    const context = new AudioContextClass();
    try {
      const playTone = (frequency: number, duration: number, delay: number) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const startAt = context.currentTime + delay;
        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.03);
        gain.gain.setValueAtTime(0.18, startAt + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + duration + 0.05);
      };

      this.log("info", "Playing two-tone hardware sound check…");
      playTone(880, 0.18, 0);
      playTone(660, 0.18, 0.22);
      await new Promise((resolve) => {
        window.setTimeout(resolve, 600);
      });
      this.log("success", "Hardware sound check finished.");
    } finally {
      await context.close();
    }
  }

  private resolveEngine(): TSpeechEngine | "none" {
    if (this.settings.engine === "browser") {
      if (this.browserAvailable) {
        return "browser";
      }
      return this.googleAvailable ? "google" : "none";
    }
    if (this.googleAvailable) {
      return "google";
    }
    return this.browserAvailable ? "browser" : "none";
  }

  private resolveBrowserVoice(): SpeechSynthesisVoice | undefined {
    if (this.settings.voiceURI) {
      const match = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.voiceURI === this.settings.voiceURI);
      if (match) {
        return match;
      }
    }
    return getEnglishVoice();
  }

  private async speakWithGoogle(
    text: string,
    voice: string,
    token: number
  ): Promise<void> {
    const chunks = splitSpeechText(text, SPEECH_CHAR_LIMIT);
    for (const [index, chunk] of chunks.entries()) {
      if (token !== this.speakToken) {
        return;
      }
      // biome-ignore lint/performance/noAwaitInLoops: TTS chunks must play sequentially so stops can be honored mid-playback
      const result = await this.playGoogleChunk(chunk, voice, token);
      if (result === "played") {
        continue;
      }
      if (result === "network" && isSpeechSynthesisSupported()) {
        this.log(
          "warn",
          "Google TTS unavailable, falling back to browser voice."
        );
        this.speakWithBrowser(chunks.slice(index).join(" "), token);
      }
      return;
    }
  }

  private playGoogleChunk(
    text: string,
    voice: string,
    token: number
  ): Promise<TGoogleChunkResult> {
    return new Promise((resolve) => {
      let settled = false;

      const interrupt = () => {
        if (token === this.speakToken) {
          this.endSpeaking();
        }
        settle("played");
      };
      const settle = (result: TGoogleChunkResult) => {
        if (settled) {
          return;
        }
        settled = true;
        if (this.chunkPlaybackResolver === interrupt) {
          this.chunkPlaybackResolver = null;
        }
        resolve(result);
      };

      this.chunkPlaybackResolver = interrupt;

      const playAudio = (audioSrc: string) => {
        const audio = new Audio();
        audio.preload = "auto";
        this.audio = audio;

        audio.onplay = () => {
          if (token === this.speakToken) {
            this.beginSpeaking("google");
          }
        };
        audio.onended = () => {
          if (this.audio === audio) {
            this.audio = null;
          }
          if (token === this.speakToken) {
            this.endSpeaking();
          }
          settle("played");
        };
        audio.onerror = () => {
          if (this.audio === audio) {
            this.audio = null;
          }
          if (token === this.speakToken) {
            this.endSpeaking();
            this.setStatus({
              ...DEFAULT_STATUS,
              error: "Could not play the synthesized audio.",
            });
          }
          settle("playback");
        };
        audio.onpause = () => {
          if (this.audio === audio) {
            this.audio = null;
          }
        };

        audio.src = audioSrc;
        audio.play().catch((error) => {
          this.handleGooglePlaybackError(token, error);
          settle("playback");
        });
      };

      const key = `${voice}:${text}`;
      const cached = this.googleAudioCache.get(key);
      if (cached !== undefined) {
        this.touchGoogleAudio(key);
        playAudio(cached);
        return;
      }

      api
        .post<{ audio: string }>(
          GOOGLE_TTS_ENDPOINT,
          { text, voice },
          { timeoutMs: 30_000 }
        )
        .then((result) => {
          if (token !== this.speakToken) {
            settle("played");
            return;
          }
          this.cacheGoogleAudio(key, result.audio);
          playAudio(result.audio);
        })
        .catch((error) => {
          if (token !== this.speakToken) {
            settle("played");
            return;
          }
          if (!isSpeechSynthesisSupported()) {
            this.endSpeaking();
            this.setStatus({
              ...DEFAULT_STATUS,
              error:
                error instanceof Error
                  ? `Google TTS unavailable: ${error.message}`
                  : "Google TTS unavailable.",
            });
          }
          settle("network");
        });
    });
  }

  private handleGooglePlaybackError(token: number, error: unknown): void {
    if (token !== this.speakToken) {
      return;
    }
    this.audio = null;
    this.endSpeaking();
    this.setStatus({
      ...DEFAULT_STATUS,
      error:
        error instanceof Error
          ? `Could not play the synthesized audio: ${error.message}`
          : "Could not play the synthesized audio.",
    });
  }

  private speakWithBrowser(text: string, token: number): void {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.resolveBrowserVoice();
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = voice?.lang ?? "en-US";
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;

    window.speechSynthesis.cancel();
    utterance.onstart = () => {
      if (token === this.speakToken) {
        this.beginSpeaking("browser");
      }
    };
    utterance.onend = () => {
      if (token === this.speakToken) {
        this.endSpeaking();
      }
    };
    utterance.onerror = () => {
      if (token === this.speakToken) {
        this.endSpeaking();
        this.setStatus({
          ...DEFAULT_STATUS,
          error: "Speech synthesis was interrupted.",
        });
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  private beginSpeaking(engine: TSpeechEngine): void {
    this.setStatus({ speaking: true, engine, error: null });
    this.clearVisemeLoop();
    this.visemeIndex = 0;
    this.visemeTimer = window.setInterval(() => {
      this.visemeIndex = (this.visemeIndex + 1) % TALKING_VISEMES.length;
      this.setStatus({ viseme: TALKING_VISEMES[this.visemeIndex] });
    }, VISEME_INTERVAL_MS);
  }

  private endSpeaking(): void {
    this.clearVisemeLoop();
    this.setStatus({ speaking: false, viseme: "rest" });
  }

  private clearVisemeLoop(): void {
    if (this.visemeTimer !== null) {
      window.clearInterval(this.visemeTimer);
      this.visemeTimer = null;
    }
  }

  private cacheGoogleAudio(key: string, audio: string): void {
    this.googleAudioCache.delete(key);
    this.googleAudioCache.set(key, audio);
    while (this.googleAudioCache.size > TTS_CACHE_MAX_ENTRIES) {
      const oldestKey = this.googleAudioCache.keys().next().value;
      if (oldestKey === undefined) {
        break;
      }
      this.googleAudioCache.delete(oldestKey);
    }
  }

  private touchGoogleAudio(key: string): void {
    const cached = this.googleAudioCache.get(key);
    if (cached !== undefined) {
      this.googleAudioCache.delete(key);
      this.googleAudioCache.set(key, cached);
    }
  }

  private resolveDiagnosticStopped(
    resolve: (result: IDiagnosticTestResult) => void,
    unsubscribe: () => void,
    timer: ReturnType<typeof window.setTimeout>,
    voicesCount: number
  ): void {
    window.clearTimeout(timer);
    unsubscribe();
    this.log("warn", "Diagnostic test stopped by the user.");
    resolve({ success: false, error: "Stopped by the user.", voicesCount });
  }

  private persistSettings(): void {
    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(this.settings)
      );
    } catch {
      // ignore storage access errors
    }
  }

  private schedulePersist(): void {
    if (this.persistTimer !== null) {
      window.clearTimeout(this.persistTimer);
    }
    this.persistTimer = window.setTimeout(() => {
      this.persistTimer = null;
      this.persistSettings();
    }, SETTINGS_PERSIST_DEBOUNCE_MS);
  }

  private log(type: TDiagnosticLogType, message: string): void {
    this.logs.push({
      id: `${Date.now()}-${this.logs.length}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    });
    this.emitLogChange();
  }

  private emitLogChange(): void {
    for (const listener of this.logListeners) {
      listener();
    }
  }

  private emitSettingsChange(): void {
    for (const listener of this.settingsListeners) {
      listener();
    }
  }

  private setStatus(next: Partial<ISpeechStatus>): void {
    this.status = { ...this.status, ...next };
    for (const listener of this.listeners) {
      listener(this.status);
    }
  }
}

export const speechService = new SpeechService();
