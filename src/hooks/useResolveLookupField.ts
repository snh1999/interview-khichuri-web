import { useCallback } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { type TLookupSchema, useBatchCreateLookups } from "@/api/lookups";

export const useResolveLookupField = <T extends FieldValues>(
  form: UseFormReturn<T>,
  schema: TLookupSchema
) => {
  const batchCreateLookup = useBatchCreateLookups(schema);

  return useCallback(
    async (
      idsName: Path<T>,
      namesName: Path<T>
    ): Promise<number[] | null | undefined> => {
      const existingIds = form.getValues(idsName) as
        | number[]
        | null
        | undefined;
      const names: string[] = form.getValues(namesName) ?? [];

      if (names.length === 0) {
        return existingIds;
      }

      try {
        const ids = await batchCreateLookup.mutateAsync(names);
        const merged = [...new Set([...(existingIds ?? []), ...ids])];
        form.setValue(idsName, merged as never, { shouldDirty: true });
        form.setValue(namesName, [] as never);

        return merged;
      } catch {
        toast.error(
          `Failed to add ${names.join(", ")}. Please try editing later.`
        );
        return existingIds;
      }
    },
    [form, batchCreateLookup]
  );
};
