import type React from "react";
import { Route, Navigate, RouteProps } from "react-router-dom";

interface ProtectedRouteProps extends RouteProps {}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ ...rest }) => {
  const token = localStorage.getItem("token");

  return (
    <Route {...rest}>
      {/* {token === null ? <Navigate to="/login" /> : null} */}
    </Route>
  )
};

export default ProtectedRoute;
