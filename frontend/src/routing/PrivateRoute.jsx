import { Outlet, Navigate } from "react-router-dom";

export const PrivateRoute = () => {
  let token = localStorage.getItem("JwtToken");

  if (token) {
    return <Outlet />;
  } else {
    return <Navigate to="/" />;
  }
};
