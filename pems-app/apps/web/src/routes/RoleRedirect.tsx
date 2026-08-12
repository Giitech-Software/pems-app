import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import { useMinimumLoadingDelay } from "../hooks/useMinimumLoadingDelay";

export default function RoleRedirect() {
  const { userProfile, loading, accessState } = useAuth();
  const isLoadingDelayActive = useMinimumLoadingDelay();

  if (loading || isLoadingDelayActive) {
    return <LoadingScreen />;
  }

  if (!userProfile || accessState === "missing") {
    return <Navigate to="/login" replace />;
  }

  if (accessState === "pending") return <Navigate to="/pending-approval" replace />;
  if (accessState !== "active") return <Navigate to="/login" replace />;

  if (userProfile.role === "tenant") {
    return <Navigate to="/tenant" replace />;
  }

  if (userProfile.role === "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
