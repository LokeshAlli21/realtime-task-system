import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LogActivities from "./pages/LogActivities.jsx";

import authService from "./services/auth.service";
import { AppContext } from "./context/AppContext";

const PrivateRoute = ({ children }) => {
  const { user, setUser } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const data = await authService.getCurrentUser();

        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [setUser]);

  // ⏳ wait until auth check completes
  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/log-activities"
        element={
          <PrivateRoute>
            <LogActivities />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;