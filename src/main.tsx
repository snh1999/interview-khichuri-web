import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter } from "react-router";
import { apiClient } from "@/api";
import { ImpersonationIndicator } from "@/components/admin/ImpersonationIndicator.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { RefetchIndicator } from "@/components/common/RefetchIndicator.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import App from "./App.tsx";

const root = document.getElementById("root");

if (!root) {
  throw new Error("root is missing");
}

createRoot(root).render(
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
