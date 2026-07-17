import { useMemo } from "react";
import type { ILookupEntry } from "@/api/lookups";

const lookupCache = new WeakMap<ILookupEntry[], Map<number, ILookupEntry>>();

export const useLookupMap = (data: ILookupEntry[]) =>
  useMemo(() => {
    let map = lookupCache.get(data);
    if (!map) {
      map = new Map(data.map((e) => [e.id, e]));
      lookupCache.set(data, map);
    }
    return map;
  }, [data]);
