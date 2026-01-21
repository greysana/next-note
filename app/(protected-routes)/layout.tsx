"use client";
import { ProtectedRoute } from "@/components/protected-route";
import Navbar from "@/components/ui/NavBar";
import { useAuth } from "@/hooks/AuthContext";

export default function ProtectRoutes({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  return (
    <ProtectedRoute>
      <Navbar userName={user?.name ?? "Guest"} onLogout={logout} />
      {children}
    </ProtectedRoute>
  );
}
