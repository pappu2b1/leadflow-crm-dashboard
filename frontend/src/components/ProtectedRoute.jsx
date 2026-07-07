import { Navigate, Outlet } from "react-router-dom";
import { LoadingState } from "./LoadingState";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { booting, isAuthenticated } = useAuth();
  if (booting) return <div className="p-6"><LoadingState label="Securing dashboard" /></div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
