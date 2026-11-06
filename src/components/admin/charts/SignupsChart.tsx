import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { IAdminStats } from "@/api/admin";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart.tsx";

const chartConfig = {
  count: {
    label: "Signups",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const formatMonthDay = (value: string) => value.slice(5);

const summarize = (data: IAdminStats["signups"]) => {
  if (data.length === 0) {
    return "No signup data available.";
  }

  const total = data.reduce((sum, day) => sum + day.count, 0);
  const peak = data.reduce((max, day) => (day.count > max.count ? day : max));

  return `Signups for the last ${data.length} days: ${total} total. Peak ${peak.count} on ${peak.date}.`;
};

export const SignupsChart = ({ data }: { data: IAdminStats["signups"] }) => {
  const summary = summarize(data);

  return (
    <figure className="min-w-0">
      <ChartContainer
        aria-hidden="true"
        className="h-64 w-full min-w-0"
        config={chartConfig}
      >
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="date"
            minTickGap={24}
            tickFormatter={formatMonthDay}
            tickLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="count"
            fill="var(--color-count)"
            stroke="var(--color-count)"
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
};
