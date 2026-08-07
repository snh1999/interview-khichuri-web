import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { queryKeys } from "@/api";
import { batchCreateLookups, type TLookupSchema } from "@/api/lookups";

export const useResolveLookupField = <T extends FieldValues>(
  form: UseFormReturn<T>,
  schema: TLookupSchema
) => {
  const queryClient = useQueryClient();

  return useCallback(
    async (
      idsName: Path<T>,
      namesName: Path<T>
    ): Promise<number[] | null | undefined> => {
      const existingIds = form.getValues(idsName) as
        | number[]
        | null
        | undefined;
      const names = (form.getValues(namesName) as string[] | null) ?? [];

      if (names.length === 0) {
        return existingIds;
      }

      try {
        const ids = await batchCreateLookups(schema, names);
        const merged = [...new Set([...(existingIds ?? []), ...ids])];
        form.setValue(idsName, merged as never, { shouldDirty: true });
        form.setValue(namesName, [] as never);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.lookups[schema],
        });
        return merged;
      } catch {
        toast.error(
          `Failed to add ${names.join(", ")}. Please try editing later.`
        );
        return existingIds;
      }
    },
    [form, queryClient, schema]
  );
};
