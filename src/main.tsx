import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";

import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { apiClient } from "@/api";
import { RefetchIndicator } from "@/components/common/RefetchIndicator.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { ImpersonationIndicator } from "@/components/admin/ImpersonationIndicator.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={apiClient}>
        <AppErrorSuspense>
          <App />
        </AppErrorSuspense>
        <ImpersonationIndicator />
        <Toaster />
        <RefetchIndicator />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
