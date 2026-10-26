import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../Loader/Loader";

// Pages that need a signed-in owner.
export const RequireAuth = () => {
  const status = useSelector((state) => state.user.status);
  const location = useLocation();

  if (status === "loading") return <Loader />;
  if (status === "guest") {
    return <Navigate to="/get-started" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

// Pages that only make sense before signing in.
export const GuestOnly = () => {
  const status = useSelector((state) => state.user.status);
  const location = useLocation();

  if (status === "loading") return <Loader />;
  if (status === "authenticated") {
    return <Navigate to={location.state?.from?.pathname ?? "/home"} replace />;
  }
  return <Outlet />;
};
