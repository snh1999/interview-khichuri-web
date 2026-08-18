import { HeartIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";

interface FavoriteButtonProps
  extends Omit<
    ComponentProps<typeof MutationButton>,
    "mutationFn" | "errorMessage" | "size" | "variant"
  > {
  isFavorite?: boolean;
  onToggle: () => Promise<unknown>;
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export const FavoriteButton = ({
  onToggle,
  children,
  isFavorite = false,
  ...props
}: FavoriteButtonProps) => (
  <MutationButton
    {...props}
    errorMessage="Failed to update favorite."
    mutationFn={onToggle}
    onClick={stopPropagation}
    size="icon-sm"
    variant="ghost"
  >
    <HeartIcon
      className={`size-3 ${isFavorite ? "text-destructive" : "text-muted-foreground"}`}
      weight={isFavorite ? "fill" : "regular"}
    />
    {children}
  </MutationButton>
);
