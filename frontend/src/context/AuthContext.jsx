import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
const USER_KEY = "leadflow_user";
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("leadflow_token"));
  const [booting, setBooting] = useState(true);
  const storeSession = (data) => {
    localStorage.setItem("leadflow_token", data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.removeItem("leadflow_admin");
    setToken(data.token); setUser(data.user);
    return data.user;
  };
  useEffect(() => {
    const loadUser = async () => {
      if (!token) { setBooting(false); return; }
      try { const { data } = await api.get("/auth/me"); setUser(data.user); localStorage.setItem(USER_KEY, JSON.stringify(data.user)); }
      catch { localStorage.removeItem("leadflow_token"); localStorage.removeItem(USER_KEY); localStorage.removeItem("leadflow_admin"); setToken(null); setUser(null); }
      finally { setBooting(false); }
    };
    loadUser();
  }, [token]);
  const login = async (email, password) => storeSession((await api.post("/auth/login", { email, password })).data);
  const openDemo = async () => storeSession((await api.post("/auth/demo")).data);
  const logout = () => { localStorage.removeItem("leadflow_token"); localStorage.removeItem(USER_KEY); localStorage.removeItem("leadflow_admin"); setToken(null); setUser(null); };
  const updateProfile = async (profile) => { const { data } = await api.put("/auth/profile", profile); localStorage.setItem(USER_KEY, JSON.stringify(data.user)); setUser(data.user); return data.user; };
  const value = { user, token, booting, isAuthenticated: Boolean(token), isDemo: user?.role === "demo", login, openDemo, logout, updateProfile };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
