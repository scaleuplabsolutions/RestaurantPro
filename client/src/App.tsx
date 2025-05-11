import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Order from "@/pages/Order";
import Reservation from "@/pages/Reservation";
import Contact from "@/pages/Contact";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminMenuManagement from "@/pages/admin/MenuManagement";
import AdminOrderManagement from "@/pages/admin/OrderManagement";
import AdminSettings from "@/pages/admin/SettingsPage";

function Router() {
  return (
    <Switch>
      {/* Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/order" component={Order} />
      <Route path="/reservation" component={Reservation} />
      <Route path="/contact" component={Contact} />
      <Route path="/profile" component={Profile} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/menu" component={AdminMenuManagement} />
      <Route path="/admin/orders" component={AdminOrderManagement} />
      <Route path="/admin/settings" component={AdminSettings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
