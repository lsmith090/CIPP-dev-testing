import { ApiGetCall } from "../api/ApiCall.jsx";
import UnauthenticatedPage from "../pages/unauthenticated.js";
import LoadingPage from "../pages/loading.js";

export const PrivateRoute = ({ children, routeType }) => {
  const {
    data: profile,
    error,
    isLoading,
  } = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
    refetchOnWindowFocus: true,
  });

  const session = ApiGetCall({
    url: "/.auth/me",
    queryKey: "authmeswa",
    refetchOnWindowFocus: true,
    staleTime: 120000, // 2 minutes
  })

  // if not logged into swa
  if (null === session?.data?.clientPrincipal || session?.data === undefined) {
    return <UnauthenticatedPage />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  let roles = null;

  if (null !== profile?.clientPrincipal && undefined !== profile) {
    roles = profile?.clientPrincipal?.userRoles;
  } else if (null === profile?.clientPrincipal || undefined === profile) {
    return <UnauthenticatedPage />;
  }
  if (null === roles) {
    return <UnauthenticatedPage />;
  } else {
    const blockedRoles = ["anonymous", "authenticated"];
    const userRoles = roles?.filter((role) => !blockedRoles.includes(role)) ?? [];
    const isAuthenticated = userRoles.length > 0 && !error;
    const isAdmin = roles.includes("admin");
    if (routeType === "admin") {
      return !isAdmin ? <UnauthenticatedPage /> : children;
    } else {
      return !isAuthenticated ? <UnauthenticatedPage /> : children;
    }
  }
};