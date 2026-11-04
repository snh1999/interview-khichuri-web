import { CalendarIcon, XIcon } from "@phosphor-icons/react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";
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
import type { ICommonInputValues } from "@/components/common/form/form.types.ts";
import { formatDate, type TDateInput, toDate } from "@/lib/date";

const formatDisplayDate = (date?: TDateInput) =>
  formatDate(date, "MMMM dd, yyyy");

interface IProps extends ICommonInputValues {
  invalid?: boolean;
  value?: TDateInput;
  name?: string;
  onBlur?: () => void;
  onChange: (value?: Date | null) => void;
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
  const [inputValue, setInputValue] = useState(
    formatDisplayDate(toDate(value))
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) {
      return;
    }
    const date = toDate(value);
    setMonth(date);
    setInputValue(formatDisplayDate(date));
  }, [isFocused, value]);

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = toDate(e.target.value);
    setInputValue(e.target.value);
    if (parsed) {
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

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    onBlur?.();
  };

  const onDateSelect = (date?: Date) => {
    onChange(date);
    setInputValue(formatDisplayDate(date));
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setInputValue("");
    setMonth(undefined);
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
          onBlur={handleBlur}
          onChange={onChangeInput}
          onFocus={handleFocus}
          onKeyDown={onArrowKeyDown}
          placeholder={placeholder}
          value={inputValue}
        />
        <InputGroupAddon align="inline-end">
          {toDate(value) ? (
            <InputGroupButton
              aria-label="Clear date"
              disabled={disabled}
              onClick={handleClear}
              size="icon-xs"
              variant="ghost"
            >
              <XIcon />
            </InputGroupButton>
          ) : null}
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
