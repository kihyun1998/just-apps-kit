"use client";

import { useEffect, useRef } from "react";
import type { AuthUser } from "../types";
import { Spinner } from "../ui/spinner";

export interface AuthCallbackViewProps {
  loading: boolean;
  user?: AuthUser | null;
  isNewUser?: boolean;
  onRoute: (destination: "login" | "terms" | "home") => void;
}

export function AuthCallbackView({
  loading,
  user,
  isNewUser,
  onRoute,
}: AuthCallbackViewProps) {
  const onRouteRef = useRef(onRoute);
  onRouteRef.current = onRoute;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      onRouteRef.current("login");
    } else if (isNewUser) {
      onRouteRef.current("terms");
    } else {
      onRouteRef.current("home");
    }
  }, [loading, user, isNewUser]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
