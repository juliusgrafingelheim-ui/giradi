import { Outlet } from "react-router";

/**
 * Root provider wrapper rendered inside the router tree.
 * CartProvider is now in App.tsx (above RouterProvider) so it's always available.
 * This component exists as the root route element for any future router-level providers.
 */
export function RootProvider() {
  return <Outlet />;
}