import { CalendarIcon } from "@phosphor-icons/react";
import { type ChangeEvent, type KeyboardEvent, useState } from "react";
import { Calendar } from "@/components/ui/calendar";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date?: Date | string) {
  if (!date) {
    return "";
  }
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date?: Date) {
  return date && !Number.isNaN(date.getTime());
}

const toDate = (val: unknown): Date | undefined => {
  if (val instanceof Date) {
    return val;
  }
  if (typeof val === "string") {
    return new Date(val);
  }
};

interface IProps{
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  value?: unknown;
  name?: string;
  onBlur?: () => void;
  onChange: (value?: Date) => void;
}

export const DatePicker = ({
  placeholder,
  disabled,
  autoFocus,
  invalid,
  value,
  name,
  onChange,
  onBlur
}: Readonly<IProps>) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(toDate(value));
  const [inputValue, setInputValue] = useState(formatDate(toDate(value)));

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = new Date(e.target.value);
    setInputValue(e.target.value);
    if (isValidDate(parsed)) {
      onChange(parsed);
      setMonth(parsed);
    }
  };

  const onArrowKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onDateSelect = (date?: Date) => {
    onChange(date);
    setInputValue(formatDate(date));
    setOpen(false);
  };

  return (
      <InputGroup>
        <InputGroupInput
          aria-invalid={invalid}
          autoFocus={autoFocus}
          className="text-xs"
          disabled={disabled}
          id={name}
          onBlur={onBlur}
          onChange={onChangeInput}
          onKeyDown={onArrowKeyDown}
          placeholder={placeholder}
          value={inputValue}
        />
        <InputGroupAddon align="inline-end">
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger
              disabled={disabled}
              render={
                <InputGroupButton
                  aria-label="Select date"
                  size="icon-xs"
                  variant="ghost"
                >
                  <CalendarIcon />
                </InputGroupButton>
              }
            />
            <PopoverContent
              align="end"
              alignOffset={-8}
              className="w-auto overflow-hidden p-0"
              sideOffset={10}
            >
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                onSelect={onDateSelect}
                selected={toDate(value)}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
  );
};
