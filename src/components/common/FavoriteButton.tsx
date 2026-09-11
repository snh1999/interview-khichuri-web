import { HeartIcon, PushPinIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";

interface IProps
  extends Omit<
    ComponentProps<typeof MutationButton>,
    "mutationFn" | "errorMessage" | "size" | "variant"
  > {
  isFavorite?: boolean;
  onToggle: () => Promise<unknown>;
  icon?: "pin" | "heart";
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export const FavoriteButton = ({
  onToggle,
  children,
  icon = "heart",
  isFavorite = false,
  ...props
}: IProps) => (
  <MutationButton
    {...props}
    errorMessage="Failed to update favorite."
    mutationFn={onToggle}
    onClick={stopPropagation}
    size="icon-sm"
    variant="ghost"
  >
    {icon === "heart" ? (
      <HeartIcon
        className={`size-3 ${isFavorite ? "text-destructive" : "text-muted-foreground"}`}
        weight={isFavorite ? "fill" : "regular"}
      />
    ) : (
      <PushPinIcon
        className={`size-3 ${isFavorite ? "text-primary" : "text-muted-foreground"}`}
        weight={isFavorite ? "fill" : "regular"}
      />
    )}
    {children}
  </MutationButton>
);
