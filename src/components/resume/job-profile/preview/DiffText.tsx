import { diffWords } from "diff";

interface IProps {
  before: string;
  after: string;
  accepted: boolean;
}

export const DiffText = ({ before, after, accepted }: IProps) => (
  <span className="wrap-break-word space-x-0.5 px-1 font-semibold">
    {diffWords(before, after).map((part, i) => {
      // biome-ignore lint/style/noNestedTernary: <>
      const dimmed = part.added ? !accepted : part.removed ? accepted : false;
      return (
        <span
          className={`${part.added ? "rounded bg-emerald-100 px-1 text-emerald-800" : ""}
              ${part.removed ? "rounded bg-red-100 px-1 text-red-800 line-through" : ""}
               ${dimmed ? "opacity-40" : "opacity-100"}
               `}
          key={i.toString()}
        >
          {part.value}
        </span>
      );
    })}
  </span>
);
