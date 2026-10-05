import { isValid, parseISO } from "date-fns";

// Union of every key name (at any depth) whose value matches V
type KeysWhere<T, V> =
  NonNullable<T> extends readonly (infer U)[]
    ? KeysWhere<U, V>
    : NonNullable<T> extends Date
      ? never
      : NonNullable<T> extends object
        ? {
            [K in keyof NonNullable<T> & string]:
              | (NonNullable<NonNullable<T>[K]> extends V ? K : never)
              | KeysWhere<NonNullable<T>[K], V>;
          }[keyof NonNullable<T> & string]
        : never;

// "a" | "a.b" | ... ; arrays are transparent (no index)
type Paths<T, P extends string = ""> =
  NonNullable<T> extends readonly (infer U)[]
    ? Paths<U, P>
    : NonNullable<T> extends Date
      ? never
      : NonNullable<T> extends object
        ? {
            [K in keyof NonNullable<T> & string]:
              | `${P}${K}`
              | Paths<NonNullable<T>[K], `${P}${K}.`>;
          }[keyof NonNullable<T> & string]
        : never;

export interface PlainTextOptions<T> {
  /** Keys skipped at any depth. */
  omit?: readonly KeysWhere<T, unknown>[];
  /** Dot paths skipped only at that location, e.g. "workExperience.company". */
  omitPaths?: readonly Paths<T>[];
  /** String / string[] keys rendered as "- " bullets. */
  bulletKeys?: readonly KeysWhere<T, string | readonly string[]>[];
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v) &&
  !(v instanceof Date);

const isBlank = (v: unknown) =>
  v === null || v === undefined || (typeof v === "string" && !v.trim());

const toLabel = (key: string) => {
  const s = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const field = (p: string, label: string, text: string): string[] => {
  const [first, ...rest] = text.split("\n");
  return [
    `${p}${label}: ${first}`,
    ...rest.map((l) => `${p}  ${l.trim()}`).filter((l) => l.trim()),
  ];
};

const scalar = (v: unknown): string => {
  if (typeof v === "string") {
    const d = parseISO(v);
    return isValid(d) ? d.toLocaleDateString() : v;
  }
  if (v instanceof Date) {
    return v.toLocaleDateString();
  }
  if (typeof v === "boolean") {
    return v ? "Yes" : "No";
  }
  return String(v);
};

export function objectToString<T extends object>(
  obj: T,
  opts: PlainTextOptions<T> = {}
): string {
  const omit = new Set<string>(opts.omit as readonly string[] | undefined);
  const omitPaths = new Set<string>(
    opts.omitPaths as readonly string[] | undefined
  );
  const bullets = new Set<string>(
    opts.bulletKeys as readonly string[] | undefined
  );

  const walk = (
    o: Record<string, unknown>,
    depth: number,
    path = ""
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <>
  ): string[] => {
    const out: string[] = [];
    const p = "  ".repeat(depth);

    for (const [k, val] of Object.entries(o)) {
      const full = path + k;
      if (isBlank(val) || omit.has(k) || omitPaths.has(full)) {
        continue;
      }

      const v = Array.isArray(val) ? val.filter((x) => !isBlank(x)) : val;
      const label = toLabel(k);

      if (Array.isArray(v)) {
        if (!v.length) {
          continue;
        }
        if (v.every(isObj)) {
          if (out.length) {
            out.push("");
          }
          out.push(`${p}${label}:`);
          v.forEach((item, i) => {
            if (i) {
              out.push("");
            }
            out.push(...walk(item, depth + 1, `${full}.`));
          });
        } else if (bullets.has(k)) {
          out.push(`${p}${label}:`, ...v.map((x) => `${p}  - ${scalar(x)}`));
        } else {
          out.push(`${p}${label}: ${v.map((x) => scalar(x)).join(", ")}`);
        }
      } else if (isObj(v)) {
        out.push(`${p}${label}:`, ...walk(v, depth + 1, `${full}.`));
      } else if (typeof v === "string" && bullets.has(k)) {
        const lines = v
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        out.push(`${p}${label}:`, ...lines.map((s) => `${p}  - ${s}`));
      } else {
        out.push(...field(p, label, scalar(v)));
      }
    }
    return out;
  };

  return walk(obj as Record<string, unknown>, 0).join("\n");
}
