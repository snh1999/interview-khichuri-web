import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { REQUIRED_FIELDS } from "@/components/job-profile/profile.data.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/shadcn-blocks/circular-progress.tsx";

interface IProps {
  data: TProfileFormData;
}

export const ProfileCompletionBanner = ({ data }: Readonly<IProps>) => {
  const { percent, missingFields } = useMemo(() => {
    const missing = REQUIRED_FIELDS.filter((f) => !f.isFilled(data));
    const filled = REQUIRED_FIELDS.length - missing.length;
    return {
      percent: Math.round((filled / REQUIRED_FIELDS.length) * 100),
      missingFields: missing.map((f) => f.label),
    };
  }, [data]);

  if (percent === 100) {
    return (
      <div className="flex items-center justify-between gap-2 py-3 font-semibold text-sm">
        <span className="text-lg">Profile</span>
        <CheckCircleIcon className="size-7 text-green-600" weight="fill" />
      </div>
    );
  }

  return (
    <Card className="w-full px-2 py-4" size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <WarningCircleIcon
            className="size-5 text-destructive"
            weight="fill"
          />
          Profile needs attention
        </CardTitle>
        <CardDescription>
          Missing fields affect match quality and resume output.
        </CardDescription>
        <CardAction>
          <CircularProgress
            className="text-destructive/70"
            labelClassName="text-foreground text-sm"
            progressStrokeWidth={8}
            showLabel
            size={75}
            value={percent}
          />
        </CardAction>
      </CardHeader>
      <CardFooter className="flex flex-wrap items-center gap-1.5">
        {missingFields.map((field) => (
          <Badge
            className="rounded-sm border border-destructive/30 font-medium text-[10px] text-destructive"
            key={field}
            variant="outline"
          >
            {field}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
};
