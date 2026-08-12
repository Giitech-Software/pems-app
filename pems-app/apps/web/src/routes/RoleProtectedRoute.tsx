import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../../../../packages/models";
import { canAccessFeature, type PemsFeature } from "../../../../packages/constants";
import LoadingScreen from "../components/LoadingScreen";
import { useMinimumLoadingDelay } from "../hooks/useMinimumLoadingDelay";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  roles: UserRole[];
  feature?: PemsFeature;
}

export default function RoleProtectedRoute({
  children,
  roles,
  feature,
}: RoleProtectedRouteProps) {
  const { firebaseUser, userProfile, loading, accessState } = useAuth();
  const isLoadingDelayActive = useMinimumLoadingDelay();

  if (loading || isLoadingDelayActive) {
    return <LoadingScreen />;
  }

  if (!firebaseUser || !userProfile || accessState === "missing") {
    return <Navigate to="/login" replace />;
  }

  if (accessState === "pending") return <Navigate to="/pending-approval" replace />;
  if (accessState !== "active") return <Navigate to="/login" replace />;

  if (!roles.includes(userProfile.role) || (feature && !canAccessFeature(userProfile.role, feature))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
