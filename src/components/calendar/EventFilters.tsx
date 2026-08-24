import { FunnelIcon } from "@phosphor-icons/react";
import type { TEventSource } from "@/api/calendar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TEventVisibility } from "./calendar.types";
import { EVENT_COLORS, EVENT_LABELS } from "./calendar.types";

const SOURCES: TEventSource[] = ["deadline", "interview", "applied", "custom"];

interface Props {
  visibility: TEventVisibility;
  onToggle: (source: TEventSource) => void;
}

export const EventFilters = ({ visibility, onToggle }: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={<Button className="size-8" size="icon" variant="outline" />}
    >
      <FunnelIcon className="size-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuGroup>
        <DropdownMenuLabel>Filter Events</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SOURCES.map((source) => {
          const colors = EVENT_COLORS[source];
          const handleCheck = () => onToggle(source);
          return (
            <DropdownMenuCheckboxItem
              checked={visibility[source]}
              key={source}
              onCheckedChange={handleCheck}
            >
              <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
              {EVENT_LABELS[source]}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);
