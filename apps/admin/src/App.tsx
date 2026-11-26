import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { NovedadEditorPage } from "./pages/NovedadEditorPage";
import { NovedadesPage } from "./pages/NovedadesPage";
import { PanelPage } from "./pages/PanelPage";

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/novedades"
        element={
          <ProtectedRoute>
            <NovedadesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/novedades/nueva"
        element={
          <ProtectedRoute>
            <NovedadEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/novedades/:id/editar"
        element={
          <ProtectedRoute>
            <NovedadEditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
