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
  size?: "icon" | "icon-sm";
}

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

const getButtonLabel = (
  icon: NonNullable<IProps["icon"]>,
  isFavorite: boolean
) => {
  if (icon !== "pin") {
    return isFavorite ? "Remove from favorites" : "Add to favorites";
  }
  return isFavorite ? "Unpin" : "Pin";
};

export const FavoriteButton = ({
  onToggle,
  children,
  icon = "heart",
  isFavorite = false,
  size = "icon-sm",
  "aria-label": ariaLabel,
  ...props
}: IProps) => (
  <MutationButton
    {...props}
    aria-label={ariaLabel ?? getButtonLabel(icon, isFavorite)}
    errorMessage="Failed to update favorite."
    mutationFn={onToggle}
    onClick={stopPropagation}
    size={size}
    variant="ghost"
  >
    {icon === "heart" ? (
      <HeartIcon
        className={`${isFavorite ? "text-destructive" : "text-muted-foreground"}`}
        weight={isFavorite ? "fill" : "regular"}
      />
    ) : (
      <PushPinIcon
        className={` ${isFavorite ? "text-primary" : "text-muted-foreground"}`}
        weight={isFavorite ? "fill" : "regular"}
      />
    )}
    {children}
  </MutationButton>
);
