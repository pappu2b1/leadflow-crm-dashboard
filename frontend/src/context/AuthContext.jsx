import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem("leadflow_admin") || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("leadflow_token"));
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setAdmin(data.admin);
        localStorage.setItem("leadflow_admin", JSON.stringify(data.admin));
      } catch {
        localStorage.removeItem("leadflow_token");
        localStorage.removeItem("leadflow_admin");
        setToken(null);
        setAdmin(null);
      } finally {
        setBooting(false);
      }
    };
    loadAdmin();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("leadflow_token", data.token);
    localStorage.setItem("leadflow_admin", JSON.stringify(data.admin));
    setToken(data.token);
    setAdmin(data.admin);
    return data.admin;
  };

  const logout = () => {
    localStorage.removeItem("leadflow_token");
    localStorage.removeItem("leadflow_admin");
    setToken(null);
    setAdmin(null);
  };

  const value = useMemo(() => ({ admin, token, booting, isAuthenticated: Boolean(token), login, logout }), [admin, token, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
