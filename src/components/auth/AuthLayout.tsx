import { Background } from "@/components/common/Background.tsx";
import { BowlFoodIcon } from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator.tsx";
import { OauthSection } from "@/components/auth/OauthSection.tsx";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface IProps {
  cardTitle: string;
  cardDescription: string;
  hideOauth?: boolean;
  hideFooter?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
}

export const AuthLayout = ({
  cardTitle,
  cardDescription,
  hideOauth,
  hideFooter,
  children,
  footer,
}: Readonly<IProps>) => {
  return (
    <Background>
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
          <BowlFoodIcon className="h-7 w-7 text-amber-500" weight="fill" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Interview Khichuri
        </h1>
        <p className="text-muted-foreground/80 mt-1 text-sm">
          Many in one interview preparation
        </p>
      </div>

      <Card className="rounded-xl px-3 py-6">
        <CardHeader>
          <CardTitle className="text-lg">{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        {children ? (
          <CardContent className="mt-2">{children}</CardContent>
        ) : null}
        <CardFooter className="text-muted-foreground flex w-full flex-col space-y-4 border-none text-center">
          {!hideOauth && (
            <>
              <div className="relative mb-6 w-full">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card text-muted-foreground px-2">
                    Or continue with
                  </span>
                </div>
              </div>
              <OauthSection />
            </>
          )}
          <p className="text-muted-foreground/80 text-center text-sm">
            {footer}
          </p>
        </CardFooter>
      </Card>

      {!hideFooter && (
        <p className="mt-6 text-center text-xs text-slate-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      )}
    </Background>
  );
};
