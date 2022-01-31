import type React from "react";
import { Route, Navigate, RouteProps } from "react-router-dom";

interface ProtectedRouteProps extends RouteProps {}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ ...rest }) => {
  const token = localStorage.getItem("token");

  if (token === null) return <Navigate to="/login" />;
  return <Route {...rest} />;
};

export default ProtectedRoute;
