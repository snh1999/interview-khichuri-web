import { Navigate, Route, Routes } from "react-router-dom"
import DashboardPage from "@/pages/DashboardPage.tsx"
import type { ReactNode } from "react"
import LoginPage from "@/pages/auth/LoginPage"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = { isAuthenticated: true } //useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
