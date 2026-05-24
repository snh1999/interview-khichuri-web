import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { getErrorMessage } from "@/lib/utils.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useNavigate } from "react-router";

interface IProps {
  children: ReactNode;
  Fallback?: (args: any) => ReactNode;
}

export const AppErrorSuspense = ({
  children,
  Fallback = Spinner,
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
    <Card className="border-destructive border">
      <CardHeader>
        <CardTitle className="text-destructive">Something went wrong</CardTitle>
        <CardDescription>{getErrorMessage(error)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Retry
        </Button>

        <Button onClick={() => navigate(0)}>Refresh</Button>
      </CardContent>
    </Card>
  );
};
