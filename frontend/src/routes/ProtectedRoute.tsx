import { JSX } from "react";
import { Navigate } from "react-router";

const isAuthenticated = () => {
  return true; // TODO: Implement real authentication
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;