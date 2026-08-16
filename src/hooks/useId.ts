import { useParams } from "react-router";
import { z } from "zod";

const uuidSchema = z.uuid();

function parseUUID(id?: string) {
  const result = uuidSchema.safeParse(id);
  if (!result.success) {
    throw new Error("Invalid id");
  }
  return result.data;
}

export function useJobId(): string {
  const { jobId } = useParams();
  return parseUUID(jobId);
}

export function useSessionId(): string {
  const { sessionId } = useParams();
  return parseUUID(sessionId);
}

export function useResumeId(): string {
  const { resumeId } = useParams();
  return parseUUID(resumeId);
}
