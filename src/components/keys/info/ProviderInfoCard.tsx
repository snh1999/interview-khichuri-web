import { ArrowSquareOutIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import type { TApiKeyProvider } from "@/api/keys";
import { LimitsAndPrivacy } from "@/components/keys/info/LimitsAndPrivacy.tsx";
import { PROVIDER_INFO } from "@/components/keys/info/provider.data.ts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface IProps {
  provider: TApiKeyProvider;
}

export const ProviderInfoCard = ({ provider }: IProps) => {
  const info = PROVIDER_INFO[provider];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm">{info.name}</CardTitle>
        <Button
          nativeButton={false}
          render={
            <Link target="_blank" to={info.getApiKeyUrl}>
              Get API Key
              <ArrowSquareOutIcon />
            </Link>
          }
          size="sm"
          variant="outline"
        />
      </CardHeader>

      <CardContent className="space-y-3">
        <ol className="list-inside list-decimal space-y-1 text-muted-foreground text-xs">
          {info.getApiKeySteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <Accordion className="mb-0 w-full rounded-xs pb-0 *:px-2">
          <AccordionItem value="pros-cons">
            <AccordionTrigger>Pros & Cons</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ul className="space-y-1 text-muted-foreground text-xs">
                  {info.pros.map((pro) => (
                    <li className="flex items-start gap-1.5" key={pro}>
                      <CheckIcon className="mt-0.5 shrink-0 text-green-600" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>

                <ul className="space-y-1">
                  {info.cons.map((con) => (
                    <li
                      className="flex items-start gap-1.5 text-muted-foreground text-xs"
                      key={con}
                    >
                      <XIcon className="mt-0.5 shrink-0 text-red-600" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <LimitsAndPrivacy info={info} />
      </CardContent>
    </Card>
  );
};
