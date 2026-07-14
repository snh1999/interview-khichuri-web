import { Link } from "react-router";
import type { IProviderInfo } from "@/components/keys/info/provider.data.ts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Badge } from "@/components/ui/badge.tsx";

const formatNumber = (n: number): string => {
  if (n === 0) {
    return "—";
  }
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(0)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(0)}K`;
  }
  return n.toLocaleString();
};

const LimitBadge = ({
  label,
  value,
  unit,
}: {
  label?: string;
  value: number;
  unit: string;
}) => {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-baseline justify-between gap-2 pt-2">
      <span className="font-medium text-foreground text-sm tabular-nums">
        {label && (
          <span className="pr-2 text-muted-foreground text-xs">{label}</span>
        )}
        {formatNumber(value)}
        <span className="ml-1 text-[11px] text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
};

export const LimitsAndPrivacy = ({
  info,
}: Readonly<{ info: IProviderInfo }>) => {
  const limitInfo = info.freeTierLimits;
  const freeTier = info.freeTier.split(".").filter(Boolean);

  return (
    <Accordion className="mb-0 w-full rounded-xs pb-0 *:px-2">
      <AccordionItem value="limits-privacy">
        <AccordionTrigger>Limits & Privacy</AccordionTrigger>
        <AccordionContent>
          <div className="pt-1 text-muted-foreground *:space-y-2">
            <div className="pb-4 text-muted-foreground text-xs">
              <div className="font-medium text-foreground">Privacy:</div>{" "}
              <p className="text-[14px]">{info.privacyNote}</p>
            </div>
            <span className="mb-2 pt-2 font-medium text-foreground">
              Free tier:
            </span>{" "}
            <ul className="space-y-1 pt-2 text-muted-foreground text-xs">
              {freeTier.map((info) => (
                <li className="flex items-start gap-1" key={info}>
                  - <span>{info}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-center gap-4 px-2">
              <div
                className={`flex gap-2 ${limitInfo.rpd && limitInfo.rpm ? "flex-1" : ""}`}
              >
                <LimitBadge label="Request" unit="/min" value={limitInfo.rpm} />
                <LimitBadge unit="/day" value={limitInfo.rpd} />
              </div>

              {limitInfo.tpm === undefined ? null : (
                <LimitBadge label="Token" unit="/min" value={limitInfo.tpm} />
              )}
              {limitInfo.contextWindow === undefined ? null : (
                <LimitBadge
                  label="Context"
                  unit=""
                  value={limitInfo.contextWindow}
                />
              )}
            </div>
            {limitInfo.notes ? (
              <p className="text-center text-[10px] text-muted-foreground italic">
                {limitInfo.notes}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-2 pt-4">
            <Badge
              render={
                <Link
                  rel="noreferrer"
                  target="_blank"
                  to={info.privacyPolicyUrl}
                >
                  Privacy Policy
                </Link>
              }
              variant="secondary"
            />

            {info.benchmarkUrl ? (
              <Badge
                render={
                  <Link rel="noreferrer" target="_blank" to={info.benchmarkUrl}>
                    Benchmarks
                  </Link>
                }
                variant="secondary"
              />
            ) : null}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
