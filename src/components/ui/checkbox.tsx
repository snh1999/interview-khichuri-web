"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { cn } from "cn";
import { CheckIcon } from "@phosphor-icons/react";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

interface ICheckboxGroupProps {
  className?: string;
  disabled?: boolean;
  value: (string | number)[];
  onValueChange: (values: (string | number)[]) => void;
  children?: React.ReactNode;
}

function CheckboxGroup({
  className,
  value = [],
  onValueChange,
  children,
}: Readonly<ICheckboxGroupProps>) {
  return (
    <div
      data-slot="checkbox-group"
      className={cn("flex flex-col gap-2", className)}
      role="group"
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<{
          value?: string | number;
          checked?: boolean;
          onCheckedChange?: (checked: boolean) => void;
        }>(child)) {
          return child;
        }
        const itemValue = child.props.value;
        return React.cloneElement(child, {
          checked: value.includes(itemValue as never),
          onCheckedChange: (checked: boolean) => {
            const next = checked
              ? [...value, itemValue as never]
              : value.filter((v) => v !== itemValue);
            onValueChange(next as (string | number)[]);
          },
        });
      })}
    </div>
  );
}

function CheckboxGroupItem({
  className,
  children,
  ...props
}: CheckboxPrimitive.Root.Props) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
      <Checkbox {...props} />
      <span className="font-normal text-foreground">{children}</span>
    </label>
  );
}

export { Checkbox, CheckboxGroup, CheckboxGroupItem };
