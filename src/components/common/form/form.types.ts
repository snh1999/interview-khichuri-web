/* eslint-disable unicorn/prevent-abbreviations */
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type {
  BaseSyntheticEvent,
  HTMLInputTypeAttribute,
  ReactNode,
} from "react";

export type TBasicFormInputProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
};

export type TFormInputProps<T extends FieldValues> = TBasicFormInputProps<T> & {
  type?: HTMLInputTypeAttribute;
  StartComponent?: ReactNode;
  EndComponent?: ReactNode;
};

export type TFormHook<T extends FieldValues> = {
  isLoading: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  form: UseFormReturn<T>;
};

export type TFormProps = {
  onSuccess?: () => void;
};
