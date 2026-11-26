import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ImportarSiuPage } from "./pages/ImportarSiuPage";
import { HistorialPage } from "./pages/HistorialPage";
import { MisCarrerasPage } from "./pages/MisCarrerasPage";
import { MapaCurricularPage } from "./pages/MapaCurricularPage";
import { PerfilPage } from "./pages/PerfilPage";

export function App() {
  return (
    <Routes>
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/importar-siu"
        element={
          <ProtectedRoute>
            <ImportarSiuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mi-carrera"
        element={
          <ProtectedRoute>
            <MapaCurricularPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/historial"
        element={
          <ProtectedRoute>
            <HistorialPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-carreras"
        element={
          <ProtectedRoute>
            <MisCarrerasPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/perfil" replace />} />
      <Route path="*" element={<Navigate to="/perfil" replace />} />
    </Routes>
  );
}
