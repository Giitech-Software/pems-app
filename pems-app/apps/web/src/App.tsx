import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Properties from "./pages/properties/Properties";
import Buildings from "./pages/buildings/Buildings";
import Rooms from "./pages/rooms/Rooms";
import Tenants from "./pages/tenants/Tenants";
import Payments from "./pages/payments/Payments";
import Reports from "./pages/reports/Reports";
import Maintenance from "./pages/maintenance/Maintenance";
import Settings from "./pages/settings/Settings";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
  path="/properties"
  element={
    <ProtectedRoute>
      <Properties />
    </ProtectedRoute>
  }
/>

<Route
  path="/buildings"
  element={
    <ProtectedRoute>
      <Buildings />
    </ProtectedRoute>
  }
/>

<Route
  path="/rooms"
  element={
    <ProtectedRoute>
      <Rooms />
    </ProtectedRoute>
  }
/>

<Route
  path="/tenants"
  element={
    <ProtectedRoute>
      <Tenants />
    </ProtectedRoute>
  }
/>

<Route
  path="/payments"
  element={
    <ProtectedRoute>
      <Payments />
    </ProtectedRoute>
  }
/>

<Route
  path="/reports"
  element={
    <ProtectedRoute>
      <Reports />
    </ProtectedRoute>
  }
/>

<Route
  path="/maintenance"
  element={
    <ProtectedRoute>
      <Maintenance />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>


        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;