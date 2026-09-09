import type {
  IInterviewQuestion,
  TInterviewMode,
} from "@/api/sessions/interviews.ts";
import { ARCHIVE_STORE, DRAFT_STORE, getDb } from "@/lib/indexdb";

export interface IInterviewTranscriptItem {
  questionId: number;
  question: string;
  answer: string;
  seconds: number;
}

export interface ILocalInterviewState {
  interviewId: string;
  sessionId: string;
  mode: TInterviewMode;
  provider: string;
  model?: string | null;
  startedAt: number;
  currentIndex: number;
  questions: IInterviewQuestion[];
  items: IInterviewTranscriptItem[];
}

export const getLocalInterviewState = async (
  interviewId: string
): Promise<ILocalInterviewState | null> => {
  const db = await getDb();
  return (await db.get(DRAFT_STORE, interviewId)) ?? null;
};

export const setLocalInterviewState = async (
  state: ILocalInterviewState
): Promise<void> => {
  const db = await getDb();
  await db.put(DRAFT_STORE, state);
};

export const clearLocalInterviewState = async (
  interviewId: string
): Promise<void> => {
  const db = await getDb();
  await db.delete(DRAFT_STORE, interviewId);
};

export const archiveLocalInterviewState = async (
  state: ILocalInterviewState
): Promise<void> => {
  const db = await getDb();
  await db.put(ARCHIVE_STORE, state);
};

export const getInterviewArchive = async (
  interviewId: string
): Promise<ILocalInterviewState | null> => {
  const db = await getDb();
  return (await db.get(ARCHIVE_STORE, interviewId)) ?? null;
};

export const clearInterviewArchive = async (
  interviewId: string
): Promise<void> => {
  const db = await getDb();
  await db.delete(ARCHIVE_STORE, interviewId);
};
