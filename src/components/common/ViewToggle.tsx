import { RowsIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { useSearchParams } from "react-router";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";

type TViewMode = "grid" | "list";
const VIEW_KEY = "view";

interface IProps {
  defaultView?: TViewMode;
}

export const useViewToggle = (defaultView: TViewMode = "grid") => {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const currentView = searchParameters.get(VIEW_KEY) ?? defaultView;
  const handleViewChange = (value: TViewMode) => {
    setSearchParameters(
      (previous) => {
        previous.set(VIEW_KEY, value);
        return previous;
      },
      { replace: true }
    );
  };

  return { handleViewChange, currentView };
};

export const ViewToggle = ({ defaultView = "grid" }: Readonly<IProps>) => {
  const { currentView, handleViewChange } = useViewToggle(defaultView);
  const handleToggle = (value: string[]) =>
    handleViewChange(value[0] as TViewMode);

  return (
    <ToggleGroup
      onValueChange={handleToggle}
      size="sm"
      spacing={0}
      value={[currentView]}
      variant="outline"
    >
      <ToggleGroupItem aria-label="Grid view" value="grid">
        <SquaresFourIcon className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="List view" value="list">
        <RowsIcon className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
