import { useMemo } from "react";
import {
  type ILookupEntry,
  useIndustries,
  useRoles,
  useTopics,
} from "@/api/lookups";

const lookupCache = new WeakMap<ILookupEntry[], Map<number, ILookupEntry>>();

const useLookupMap = (data: ILookupEntry[]) =>
  useMemo(() => {
    let map = lookupCache.get(data);
    if (!map) {
      map = new Map(data.map((e) => [e.id, e]));
      lookupCache.set(data, map);
    }
    return map;
  }, [data]);

export const useTopicsMap = () => useLookupMap(useTopics().data);

export const useIndustryMap = () => useLookupMap(useIndustries().data);

export const useRolesMap = () => useLookupMap(useRoles().data);
