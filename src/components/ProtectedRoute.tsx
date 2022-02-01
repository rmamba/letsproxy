import type React from "react";
import { Navigate } from "react-router";

const ProtectedRoute: (props: any) => JSX.Element = props => {
  const { children } = props;
  const authed = localStorage.getItem("token") !== null;

  return authed
    ? children
    : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
