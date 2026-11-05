import { diffWords } from "diff";

interface IProps {
  before: string;
  after: string;
  accepted: boolean;
}

export const DiffText = ({ before, after, accepted }: IProps) => (
  <span className="space-x-0.5 px-1 font-semibold wrap-break-word">
    {diffWords(before, after).map((part, i) => {
      // biome-ignore lint/style/noNestedTernary: <>
      const dimmed = part.added ? !accepted : part.removed ? accepted : false;
      return (
        <span
          className={`${part.added ? "bg-signal-success/15 text-signal-success-foreground rounded px-1" : ""}
              ${part.removed ? "bg-signal-danger/15 text-signal-danger-foreground rounded px-1 line-through" : ""}
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
