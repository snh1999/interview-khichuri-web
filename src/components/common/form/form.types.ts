import type {
  BaseSyntheticEvent,
  HTMLInputTypeAttribute,
  ReactNode,
} from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

export interface ICommonInputValues {
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}
export interface TBasicFormInputProps<T extends FieldValues>
  extends ICommonInputValues {
  form: UseFormReturn<T>;
  name: Path<T>;
}

export type IFormInputProps<T extends FieldValues> = TBasicFormInputProps<T> & {
  type?: HTMLInputTypeAttribute;
  // biome-ignore lint/style/useNamingConvention: <component type>
  StartComponent?: ReactNode;
  // biome-ignore lint/style/useNamingConvention: <component type>
  EndComponent?: ReactNode;
  textArea?: boolean;
};

export interface IFormHook<T extends FieldValues> {
  isLoading: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  form: UseFormReturn<T>;
}

export interface IFormProps {
  onSuccess?: () => void;
}
