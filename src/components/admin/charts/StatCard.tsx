import type { Icon } from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface IProps {
  title: string;
  value: string | number;
  icon?: Icon;
  description?: string;
}

export const StatCard = ({
  title,
  value,
  icon: StatIcon,
  description,
}: Readonly<IProps>) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between gap-2">
      <CardTitle className="font-normal text-muted-foreground text-sm">
        {title}
      </CardTitle>
      {StatIcon ? (
        <StatIcon aria-hidden className="size-4 text-muted-foreground" />
      ) : null}
    </CardHeader>
    <CardContent>
      <p className="font-heading font-semibold text-2xl tabular-nums">
        {value}
      </p>
      {description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
    </CardContent>
  </Card>
);
