import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type RenderOptions,
  render as rtlRender,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";

interface IRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const render = (
  ui: ReactElement,
  { route = "/", ...options }: IRenderOptions = {}
) => {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup({ delay: null });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={queryClient}>
        <AppErrorSuspense>{children}</AppErrorSuspense>
      </QueryClientProvider>
    </MemoryRouter>
  );
  return { queryClient, user, ...rtlRender(ui, { wrapper, ...options }) };
};
