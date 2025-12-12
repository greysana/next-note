"use client";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/hooks/AuthContext";

export default function ProtectRoutes({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  return (
    <ProtectedRoute>
      {user?.name ?? ""}
      <button
        onClick={() => {
          logout();
        }}
      >
        logout
      </button>
      {children}
    </ProtectedRoute>
  );
}
