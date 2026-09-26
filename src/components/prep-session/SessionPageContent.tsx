import { PlusCircleIcon } from "@phosphor-icons/react";
import { useCallback, useDeferredValue, useMemo } from "react";
import { useRoles } from "@/api/lookups";
import { type IPrepSession, useSessions } from "@/api/sessions";
import { useViewToggle } from "@/components/common/ViewToggle.tsx";
import { useJobFilter } from "@/components/prep-session/JobFilter.tsx";
import { SessionCardGrid } from "@/components/prep-session/SessionCardGrid.tsx";
import { SessionListRow } from "@/components/prep-session/SessionListRow.tsx";
import { getSessionTopicIds } from "@/components/prep-session/session.helpers.ts";
import { useTopicFilter } from "@/components/prep-session/TopicFilter.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ItemGroup } from "@/components/ui/item.tsx";
import { useLookupMap } from "@/hooks/useLookupMap.ts";
import { useStrictSafeAutoAnimate } from "@/hooks/useStrictSafeAutoAnimate";
import { createSessionSearch } from "@/lib/search";

const matchesJobFilter = (session: IPrepSession, jobFilter?: string | null) =>
  jobFilter ? session.jobId === jobFilter : true;

const matchesTopicFilter = (
  session: IPrepSession,
  selectedTopicIds: number[]
) => {
  if (selectedTopicIds.length === 0) {
    return true;
  }
  return selectedTopicIds.some((id) =>
    getSessionTopicIds(session).includes(id)
  );
};

interface IProps {
  search?: string;
  onNewSession?: () => void;
}

export const SessionPageContent = ({ search = "", onNewSession }: IProps) => {
  const { data: sessions } = useSessions();
  const rolesMap = useLookupMap(useRoles().data);

  const { currentView } = useViewToggle("grid");
  const { jobFilter } = useJobFilter();
  const { selectedTopicIds } = useTopicFilter();
  const [gridParent] = useStrictSafeAutoAnimate();
  const [listParent] = useStrictSafeAutoAnimate();

  const roleName = useCallback(
    (roleId?: number | null) => rolesMap.get(roleId ?? 0)?.name,
    [rolesMap]
  );

  const deferredSearch = useDeferredValue(search);

  const searchIndex = useMemo(
    () => createSessionSearch(sessions, roleName),
    [sessions, roleName]
  );

  const sessionsById = useMemo(
    () => new Map(sessions.map((session) => [session.id, session])),
    [sessions]
  );

  const filteredSessions = useMemo(() => {
    const matched = searchIndex
      .search(deferredSearch)
      .map((result) => sessionsById.get(result.doc.id))
      .filter((session): session is IPrepSession => session !== undefined);
    return matched.filter(
      (session) =>
        matchesJobFilter(session, jobFilter) &&
        matchesTopicFilter(session, selectedTopicIds)
    );
  }, [searchIndex, deferredSearch, sessionsById, jobFilter, selectedTopicIds]);

  if (filteredSessions.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            {sessions.length === 0
              ? "No sessions yet"
              : "No sessions match your search."}
          </EmptyTitle>
          <EmptyDescription>
            {sessions.length === 0
              ? "Create your first preparation session to start practicing interview questions."
              : `${filteredSessions.length} of ${sessions.length} sessions match. Try adjusting your search or removing filters.`}
          </EmptyDescription>
        </EmptyHeader>
        <Button onClick={onNewSession}>
          <PlusCircleIcon className="size-3" weight="bold" />
          New Session
        </Button>
      </Empty>
    );
  }

  if (currentView === "grid") {
    return (
      <div
        className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
        ref={gridParent}
      >
        {filteredSessions.map((session) => (
          <SessionCardGrid
            jobLabel={roleName(session.roleId)}
            key={session.id}
            session={session}
          />
        ))}
      </div>
    );
  }

  if (currentView === "list") {
    return (
      <ItemGroup
        className="overflow-hidden rounded-sm bg-card"
        ref={listParent}
      >
        {filteredSessions.map((session) => (
          <SessionListRow
            key={session.id}
            session={session}
            subtitle={roleName(session.roleId)}
          />
        ))}
      </ItemGroup>
    );
  }
};
