import { useCallback, useMemo } from "react";
import { useRoles } from "@/api/lookups";
import { type IPrepSession, useSessions } from "@/api/sessions";
import { useViewToggle } from "@/components/common/ViewToggle.tsx";
import { useJobFilter } from "@/components/prep-session/JobFilter.tsx";
import { SessionCardGrid } from "@/components/prep-session/SessionCardGrid.tsx";
import { SessionListRow } from "@/components/prep-session/SessionListRow.tsx";
import { useTopicFilter } from "@/components/prep-session/TopicFilter.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ItemGroup } from "@/components/ui/item.tsx";
import { useLookupMap } from "@/hooks/useLookupMap.ts";
import { useStrictSafeAutoAnimate } from "@/hooks/useStrictSafeAutoAnimate";

interface ISessionFilters {
  jobFilter?: string | null;
  roleName: (roleId?: number | null) => string | undefined;
  search: string;
  selectedTopicIds: number[];
}

const matchesJobFilter = (session: IPrepSession, jobFilter?: string | null) =>
  jobFilter ? session.jobId === jobFilter : true;

const matchesTopicFilter = (
  session: IPrepSession,
  selectedTopicIds: number[]
) => {
  if (selectedTopicIds.length === 0) {
    return true;
  }
  const sessionTopicIds = (session.sessionTopics ?? []).map((st) => st.topicId);
  return selectedTopicIds.some((id) => sessionTopicIds.includes(id));
};

const matchesSearch = (
  session: IPrepSession,
  query: string,
  roleName: ISessionFilters["roleName"]
) => {
  if (query.length === 0) {
    return true;
  }
  const role = roleName(session.roleId);
  return (
    session.title.toLowerCase().includes(query) ||
    (session.description ?? "").toLowerCase().includes(query) ||
    role?.toLowerCase().includes(query)
  );
};

const filterSession = (session: IPrepSession, filters: ISessionFilters) =>
  matchesJobFilter(session, filters.jobFilter) &&
  matchesTopicFilter(session, filters.selectedTopicIds) &&
  matchesSearch(session, filters.search.toLowerCase().trim(), filters.roleName);

export const SessionPageContent = ({ search = "" }: { search?: string }) => {
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

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) =>
        filterSession(session, {
          jobFilter,
          roleName,
          search,
          selectedTopicIds,
        })
      ),
    [sessions, jobFilter, selectedTopicIds, search, roleName]
  );

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
              ? " Create your first preparation session to start practicing interview questions."
              : "Try adjusting your search or removing filters."}
          </EmptyDescription>
        </EmptyHeader>
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
