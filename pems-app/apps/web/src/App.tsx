import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import PendingApproval from "./pages/auth/PendingApproval";

import Dashboard from "./pages/dashboard/Dashboard";
import Properties from "./pages/properties/Properties";
import PropertyDetails from "./pages/properties/PropertyDetails";
import Buildings from "./pages/buildings/Buildings";
import Rooms from "./pages/rooms/Rooms";
import Tenants from "./pages/tenants/Tenants";
import Payments from "./pages/payments/Payments";
import OverdueRent from "./pages/payments/OverdueRent";
import Messages from "./pages/messages/Messages";
import Reports from "./pages/reports/Reports";
import Maintenance from "./pages/maintenance/Maintenance";
import Notifications from "./pages/notifications/Notifications";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/settings/Settings";

import TenantDashboard from "./pages/tenant/TenantDashboard";

import RoleRedirect from "./routes/RoleRedirect";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLandlords from "./pages/admin/AdminLandlords";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import SuperAdminSetup from "./pages/admin/SuperAdminSetup";
import TenantMyRoom from "./pages/tenant/TenantMyRoom";
import TenantRentStatus from "./pages/tenant/TenantRentStatus";
import TenantPaymentHistory from "./pages/tenant/TenantPaymentHistory";
import TenantMaintenance from "./pages/tenant/TenantMaintenance";
import TenantMessages from "./pages/tenant/TenantMessages";
import TenantNotifications from "./pages/tenant/TenantNotifications";
import TenantProfile from "./pages/tenant/TenantProfile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/setup-super-admin" element={<SuperAdminSetup />} />

          <Route
            path="/dashboard"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Dashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/properties"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Properties />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/properties/:propertyId"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <PropertyDetails />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/buildings"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Buildings />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/rooms"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Rooms />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/tenants"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Tenants />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Payments />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/overdue-rent"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <OverdueRent />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Messages />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Reports />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/maintenance"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Maintenance />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Notifications />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Profile />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <RoleProtectedRoute roles={["landlord", "property_manager"]}>
                <Settings />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/tenant"
            element={
              <RoleProtectedRoute roles={["tenant"]}>
                <TenantDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/tenant/my-room"
            element={
              <RoleProtectedRoute roles={["tenant"]}>
                <TenantMyRoom />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/tenant/rent-status"
            element={
              <RoleProtectedRoute roles={["tenant"]}>
                <TenantRentStatus />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/tenant/payment-history"
            element={
              <RoleProtectedRoute roles={["tenant"]}>
                <TenantPaymentHistory />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/tenant/maintenance"
            element={
              <RoleProtectedRoute roles={["tenant"]}>
                <TenantMaintenance />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/tenant/messages"
            element={
              <RoleProtectedRoute roles={["tenant"]}>
                <TenantMessages />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/tenant/notifications"
            element={
              <RoleProtectedRoute roles={["tenant"]}>
                <TenantNotifications />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/tenant/profile"
            element={
              <RoleProtectedRoute roles={["tenant"]}>
                <TenantProfile />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute roles={["super_admin"]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RoleProtectedRoute roles={["super_admin"]}>
                <AdminUsers />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/landlords"
            element={
              <RoleProtectedRoute roles={["super_admin"]}>
                <AdminLandlords />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/properties"
            element={
              <RoleProtectedRoute roles={["super_admin"]}>
                <AdminProperties />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <RoleProtectedRoute roles={["super_admin"]}>
                <AdminReports />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <RoleProtectedRoute roles={["super_admin"]}>
                <AdminSettings />
              </RoleProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
