import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export type TDateInput = Date | string | number | null | undefined;

export const toDate = (value: TDateInput): Date | undefined => {
  if (value === null || value === undefined || value === "") {
    return;
  }

  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number") {
    date = new Date(value);
  } else {
    date = parseISO(value);
    if (!isValid(date)) {
      date = new Date(value);
    }
  }

  return isValid(date) ? date : undefined;
};

export const formatDate = (value: TDateInput, pattern?: string): string => {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  return pattern
    ? format(date, pattern)
    : new Intl.DateTimeFormat().format(date);
};

export const formatDateTime = (value: TDateInput, pattern = "PPp"): string =>
  formatDate(value, pattern);

export const formatTime = (value: TDateInput, pattern = "p"): string =>
  formatDate(value, pattern);

export const formatRelative = (value: TDateInput): string => {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "";
};
