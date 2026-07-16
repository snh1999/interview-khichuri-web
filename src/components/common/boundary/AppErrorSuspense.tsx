import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { getErrorMessage } from "@/lib/utils.ts";
import { EmptyPage } from "@/pages/EmptyPage.tsx";

interface IProps {
  children: ReactNode;
  fallback?: (args: object) => ReactNode;
  errorPage?: boolean;
  errorFallback?: (args: FallbackProps) => ReactNode;
}

export const AppErrorSuspense = ({
  children,
  errorPage,
  fallback: Fallback = Spinner,
  errorFallback: ErrorFallbackComponent,
}: Readonly<IProps>) => {
  const queryClient = useQueryClient();
  return (
    <ErrorBoundary
      FallbackComponent={
        (ErrorFallbackComponent ?? errorPage)
          ? ErrorFallbackPage
          : ErrorFallbackCard
      }
      onReset={() => queryClient.resetQueries()}
    >
      <Suspense fallback={<Fallback />}>{children}</Suspense>
    </ErrorBoundary>
  );
};

const ErrorFallbackCard = ({
  error,
  resetErrorBoundary,
}: Readonly<FallbackProps>) => {
  const navigate = useNavigate();
  return (
    <Card className="border border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Something went wrong</CardTitle>
        <CardDescription>{getErrorMessage(error)}</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-5">
        <Button onClick={resetErrorBoundary} variant="outline">
          Retry
        </Button>

        <Button onClick={() => navigate(0)}>Refresh</Button>
      </CardContent>
    </Card>
  );
};

const ErrorFallbackPage = ({
  error,
  resetErrorBoundary,
}: Readonly<FallbackProps>) => {
  const navigate = useNavigate();
  return (
    <EmptyPage description={getErrorMessage(error)}>
      <div className="flex justify-between gap-5">
        <Button onClick={resetErrorBoundary} variant="outline">
          Retry
        </Button>

        <Button onClick={() => navigate(0)}>Refresh</Button>
      </div>
    </EmptyPage>
  );
};
