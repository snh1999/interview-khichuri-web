import { useParams } from "react-router";
import { z } from "zod";

const jobIdSchema = z.uuid();

export function useJobId(): string {
  const { jobId } = useParams();
  const result = jobIdSchema.safeParse(jobId);
  if (!result.success) {
    throw new Error("Invalid job id");
  }
  return result.data;
}
