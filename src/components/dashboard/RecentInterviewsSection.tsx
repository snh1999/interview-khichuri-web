import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import { useAllInterviews } from "@/api/sessions/interviews";
import { SESSIONS_PAGE } from "@/app.constants";
import { RECENT_INTERVIEWS_COUNT } from "@/components/dashboard/dashboard.helpers.ts";
import { InterviewItem } from "@/components/interview/InterviewItem.tsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const RecentInterviewsSection = () => {
  const { data: interviews } = useAllInterviews({
    completed: false,
    limit: RECENT_INTERVIEWS_COUNT,
  });

  if (!interviews || interviews.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-base">
          Recent interviews
        </CardTitle>
        <CardAction>
          <Button
            nativeButton={false}
            render={<Link to={SESSIONS_PAGE} />}
            size="sm"
            variant="outline"
          >
            View
            <ArrowSquareOutIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {interviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No interviews in progress.
          </p>
        ) : (
          interviews.map((interview) => (
            <InterviewItem interview={interview} key={interview.id} />
          ))
        )}
      </CardContent>
    </Card>
  );
};
