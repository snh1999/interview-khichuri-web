import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { IAdminStats } from "@/api/admin";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart.tsx";

const LABELS: Record<string, string> = {
  apiKeys: "API keys",
  calendarEvents: "Calendar",
  companies: "Companies",
  interviews: "Interviews",
  jobs: "Jobs",
  notes: "Notes",
  prepSessions: "Prep sessions",
  prompts: "Prompts",
  resumes: "Resumes",
};

const chartConfig = {
  value: {
    label: "Count",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const UsageChart = ({ usage }: { usage: IAdminStats["usage"] }) => {
  const data = Object.entries(usage).map(([key, value]) => ({
    name: LABELS[key] ?? key,
    value,
  }));

  return (
    <ChartContainer className="h-72 w-full" config={chartConfig}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="name"
          height={70}
          interval={0}
          textAnchor="end"
          tickLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};
