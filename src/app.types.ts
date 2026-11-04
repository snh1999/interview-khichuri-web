import type { ComponentProps, ElementType } from "react";

export type IntersectionFields<T, U> = Pick<
  T,
  {
    [K in keyof T & keyof U]: T[K] extends U[K]
      ? U[K] extends T[K]
        ? K
        : never
      : never;
  }[keyof T & keyof U]
>;

export type PropIntersection<
  T extends ElementType,
  U extends ElementType,
> = IntersectionFields<ComponentProps<T>, ComponentProps<U>>;
