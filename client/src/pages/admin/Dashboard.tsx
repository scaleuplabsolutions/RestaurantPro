import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import AdminNavigation from "@/components/admin/AdminNavigation";
import StatCard from "@/components/admin/StatCard";
import OrderItem from "@/components/admin/OrderItem";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Calendar 
} from "lucide-react";
import { initializeSocket, onMessage } from "@/lib/socket";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

export default function AdminDashboard() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      setLocation("/");
    } else if (!isAuthenticated) {
      setLocation("/profile");
    }
  }, [isAdmin, isAuthenticated, setLocation]);

  // Initialize websocket for real-time updates
  useEffect(() => {
    if (!isAdmin) return;
    
    const socket = initializeSocket();
    
    // Listen for new orders
    const unsubscribe = onMessage("order-created", (data) => {
      toast({
        title: "New Order Received",
        description: `Order #${data.id} has been received.`,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isAdmin, toast]);

  // Fetch orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAdmin,
  });

  // Fetch reservations
  const { data: reservations = [], isLoading: isLoadingReservations } = useQuery({
    queryKey: ['/api/reservations'],
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  // Calculate statistics
  const totalOrders = orders.length;
  const revenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
  const activeOrders = orders.filter((order: any) => 
    order.status !== "completed" && order.status !== "cancelled"
  ).length;
  const todayReservations = reservations.filter((res: any) => {
    const resDate = new Date(res.date);
    const today = new Date();
    return resDate.toDateString() === today.toDateString();
  }).length;

  // Sort orders to show most recent first
  const sortedOrders = [...orders].sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get recent orders (top 3)
  const recentOrders = sortedOrders.slice(0, 3);

  return (
    <div className="p-4 pb-20">
      <Helmet>
        <title>Admin Dashboard - Paul's Restaurant</title>
        <meta name="description" content="Manage your restaurant's operations, view analytics, and process orders." />
      </Helmet>
      
      <div className="flex items-center justify-between mb-5">
        <h2 className="heading text-2xl font-semibold text-neutral-900">Admin Dashboard</h2>
        <div className="text-sm font-medium px-3 py-1 bg-primary text-white rounded-full">Admin</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard 
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          trend="+12% from last week"
          trendUp={true}
        />
        
        <StatCard 
          title="Revenue"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(revenue)}
          icon={DollarSign}
          trend="+8% from last week"
          trendUp={true}
        />
        
        <StatCard 
          title="Active Orders"
          value={activeOrders}
          icon={Clock}
          subtitle="Updated just now"
        />
        
        <StatCard 
          title="Reservations"
          value={todayReservations}
          icon={Calendar}
          subtitle="For today"
        />
      </div>
      
      <div className="bg-white border rounded-lg p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Recent Orders</h3>
          <Button 
            variant="link" 
            className="text-sm text-primary font-medium p-0 h-auto"
            onClick={() => setLocation("/admin/orders")}
          >
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoadingOrders ? (
            <p className="text-sm text-neutral-500">Loading orders...</p>
          ) : recentOrders.length > 0 ? (
            recentOrders.map((order: any) => (
              <OrderItem key={order.id} order={order} />
            ))
          ) : (
            <p className="text-sm text-neutral-500">No orders yet.</p>
          )}
        </div>
      </div>
      
      <AdminNavigation />
    </div>
  );
}
