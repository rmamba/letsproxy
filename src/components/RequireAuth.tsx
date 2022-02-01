import type React from "react";
import { Navigate } from "react-router";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RequireAuth: (props: any) => JSX.Element = props => {
  const { children } = props;
  const authed = localStorage.getItem("token") !== null;

  return authed
    ? children
    : <Navigate to="/login" replace />;
}

export default RequireAuth;
