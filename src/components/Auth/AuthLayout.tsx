import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthLayoutProps {
  requireAuth?: boolean;
  requiredRole?: "admin" | "manager" | "user";
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  requireAuth = false,
  requiredRole,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // If auth is required and user is not logged in, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in but doesn't have the required role
  if (requireAuth && user && requiredRole) {
    const roleHierarchy: Record<string, number> = {
      admin: 3,
      manager: 2,
      user: 1,
    };

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If user is already logged in and tries to access login page, redirect to home
  if (
    !requireAuth &&
    user &&
    ["/login", "/register", "/forgot-password"].includes(location.pathname)
  ) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
