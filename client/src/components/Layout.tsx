import { ReactNode, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import BottomNavigation from "./BottomNavigation";
import { useLocation } from "wouter";
import { initializeSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function Layout({ children, hideNav = false }: LayoutProps) {
  const { isAdmin } = useAuth();
  const [location] = useLocation();

  // Initialize websocket connection
  useEffect(() => {
    const socket = initializeSocket();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Check if the current route is an admin route
  const isAdminRoute = location.startsWith("/admin");

  // Don't show the bottom navigation on admin routes
  const showNav = !hideNav && !isAdminRoute;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow pb-16">
      <Toaster />

      <main>
        {children}
      </main>

      {showNav && <BottomNavigation />}
    </div>
  );
}
