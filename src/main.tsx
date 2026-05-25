import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { apiClient } from "@/api";
import { Toaster } from "sonner";
import { RefetchIndicator } from "@/components/common/RefetchIndicator.tsx";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { ImpersonationIndicator } from "@/components/admin/ImpersonationIndicator.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
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
    </ThemeProvider>
  </StrictMode>
)
