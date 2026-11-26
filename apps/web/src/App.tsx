import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
      <Route path="/" element={<Navigate to="/perfil" replace />} />
      <Route path="*" element={<Navigate to="/perfil" replace />} />
    </Routes>
  );
}
