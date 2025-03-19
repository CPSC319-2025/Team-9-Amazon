import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../api/login";
import { DecodedToken } from "../types/utils";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "hiringManager";
}

const RoleProtectedRoute = ({
  children,
  requiredRole,
}: RoleProtectedRouteProps) => {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    // Check for required role
    const hasAccess =
      requiredRole === "admin" ? decoded.isAdmin : decoded.isHiringManager;

    if (!hasAccess) {
      // Redirect to home if user doesn't have required role
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    // If token is invalid, redirect to login
    localStorage.removeItem("token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default RoleProtectedRoute;
