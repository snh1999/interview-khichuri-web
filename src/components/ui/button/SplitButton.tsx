import type { ReactNode } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ISplitButtonItem
  extends Omit<React.ComponentProps<typeof Button>, "children" | "variant"  | "size"> {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface ISplitButtonProps extends VariantProps<typeof buttonVariants> {
  primary: ISplitButtonItem;
  items: ISplitButtonItem[];
  className?: string;
  triggerProps?: Omit<React.ComponentProps<typeof Button>, "children" | "onClick" | "disabled">;
  dropdownProps?: React.ComponentProps<typeof DropdownMenuContent>;
}

export const SplitButton = ({
  primary: { label: primaryLabel, icon: primaryIcon, ...primaryProps },
  items,
  variant = "default",
  size,
  className,
  triggerProps,
  dropdownProps,
}: Readonly<ISplitButtonProps>) => {
  if (items.length === 0) {
    return (
      <Button
        {...primaryProps}
        className={cn(className, primaryProps.className)}
        onClick={primaryProps.onClick}
        size={size}
        variant={variant}
      >
        {primaryIcon ? <span>{primaryIcon}</span> : null}
        {primaryLabel}
      </Button>
    );
  }

  return (
    <ButtonGroup className={className}>
      <Button
        {...primaryProps}
        className={primaryProps.className}
        onClick={primaryProps.onClick}
        size={size}
        variant={variant}
      >
        {primaryIcon ? <span>{primaryIcon}</span> : null}
        {primaryLabel}
      </Button>
      <ButtonGroupSeparator className="bg-border/50" />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="More options"
              {...triggerProps}
              className={cn("px-1.5! [&_svg]:size-3.5", triggerProps?.className)}
              disabled={items.every((item) => item.disabled)}
              size={size === "lg" ? "icon-lg" : size === "sm" ? "icon-sm" : "icon"}
              variant={variant}
            />
          }
        >
          <CaretDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent {...dropdownProps} className={dropdownProps?.className}>
          {items.map(({ label, icon, className, disabled, onClick }, index) => (
            <DropdownMenuItem
              className={className}
              disabled={disabled}
              key={`${label}-${index}`}
              onClick={onClick}
            >
              {label}
              {icon ? <span>{icon}</span> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
};
