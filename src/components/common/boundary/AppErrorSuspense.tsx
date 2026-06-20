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

interface IProps {
  children: ReactNode;
  fallback?: (args: object) => ReactNode;
}

export const AppErrorSuspense = ({
  children,
  fallback: Fallback = Spinner,
}: Readonly<IProps>) => {
  const queryClient = useQueryClient();
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => queryClient.resetQueries()}
    >
      <Suspense fallback={<Fallback />}>{children}</Suspense>
    </ErrorBoundary>
  );
};

const ErrorFallback = ({
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
