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
          className={`${part.added ? "rounded bg-signal-success/15 px-1 text-signal-success-foreground" : ""}
              ${part.removed ? "rounded bg-signal-danger/15 px-1 text-signal-danger-foreground line-through" : ""}
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
