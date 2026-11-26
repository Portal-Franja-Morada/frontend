import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { EventoEditorPage } from "./pages/EventoEditorPage";
import { EventosPage } from "./pages/EventosPage";
import { NovedadEditorPage } from "./pages/NovedadEditorPage";
import { NovedadesPage } from "./pages/NovedadesPage";
import { PanelPage } from "./pages/PanelPage";
import { ApuntesPage } from "./pages/ApuntesPage";
import { ImportarApuntesPage } from "./pages/ImportarApuntesPage";
import { ImportarPadronPage } from "./pages/ImportarPadronPage";
import { PendientesPage } from "./pages/PendientesPage";

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
      <Route
        path="/eventos"
        element={
          <ProtectedRoute>
            <EventosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eventos/nuevo"
        element={
          <ProtectedRoute>
            <EventoEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eventos/:id/editar"
        element={
          <ProtectedRoute>
            <EventoEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pendientes"
        element={
          <ProtectedRoute>
            <PendientesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/importar-padron"
        element={
          <ProtectedRoute>
            <ImportarPadronPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apuntes"
        element={
          <ProtectedRoute>
            <ApuntesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/importar-apuntes"
        element={
          <ProtectedRoute>
            <ImportarApuntesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
