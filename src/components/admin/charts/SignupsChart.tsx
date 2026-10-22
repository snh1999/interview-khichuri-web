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

export const SignupsChart = ({ data }: { data: IAdminStats["signups"] }) => (
  <ChartContainer className="h-64 w-full" config={chartConfig}>
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
);
