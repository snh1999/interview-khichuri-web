import { format } from "date-fns";
import { generatePath, useNavigate } from "react-router";
import type { ILookupEntry } from "@/api/lookups";
import type { IPrepSession } from "@/api/sessions";
import { SESSION_DETAIL_PAGE } from "@/app.constants.ts";

interface ISessionTopicsSource {
  topicIds?: number[] | null;
  sessionTopics?: Array<{ topicId: number }> | null;
}

export const formatSessionDate = (value: string) => format(value, "d MMM yyyy");

export const getSessionTopicIds = (session: ISessionTopicsSource) =>
  session.topicIds ?? (session.sessionTopics ?? []).map((st) => st.topicId);

export const useNavigateToSessionPage = (id: string) => {
  const navigate = useNavigate();

  return () => {
    navigate(generatePath(SESSION_DETAIL_PAGE, { sessionId: id }));
  };
};

export const getMetaLabel = (
  session: IPrepSession,
  topicMap: Map<number, ILookupEntry>,
  subtitle?: string
) => {
  const topicLabel = getSessionTopicIds(session)
    .map((topicId) => topicMap.get(topicId)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    subtitle?.trim() ||
    topicLabel?.trim() ||
    session.description?.trim() ||
    "Standalone session"
  );
};
