import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import AdminNavigation from "@/components/admin/AdminNavigation";
import OrderItem from "@/components/admin/OrderItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { initializeSocket, onMessage } from "@/lib/socket";
import { Helmet } from "react-helmet";

export default function AdminOrderManagement() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

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
    
    // Listen for order events
    const newOrderUnsubscribe = onMessage("order-created", () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      // Show notification if we're not on the active orders tab
      if (activeTab !== "active") {
        toast({
          title: "New Order Received",
          description: "You have a new order to process.",
        });
      }
    });

    const updateOrderUnsubscribe = onMessage("order-updated", () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    });

    return () => {
      newOrderUnsubscribe();
      updateOrderUnsubscribe();
    };
  }, [isAdmin, queryClient, toast, activeTab]);

  // Fetch all orders
  const { data: allOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAdmin,
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "The order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (!allOrders) return [];

    switch (activeTab) {
      case "new":
        return allOrders.filter((order: any) => order.status === "pending");
      case "processing":
        return allOrders.filter((order: any) => order.status === "processing");
      case "delivery":
        return allOrders.filter((order: any) => order.status === "out_for_delivery");
      case "completed":
        return allOrders.filter((order: any) => order.status === "completed");
      case "cancelled":
        return allOrders.filter((order: any) => order.status === "cancelled");
      case "active":
        return allOrders.filter((order: any) => 
          ["pending", "processing", "out_for_delivery"].includes(order.status)
        );
      default:
        return allOrders;
    }
  };

  // Sort orders by creation date (newest first)
  const sortedOrders = getFilteredOrders().sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Handle order status change
  const handleStatusChange = async (orderId: number, status: string) => {
    await updateOrderMutation.mutateAsync({ orderId, status });
  };

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="p-4 pb-20">
      <Helmet>
        <title>Order Management - Admin Dashboard</title>
        <meta name="description" content="Manage customer orders, track deliveries, and update order statuses." />
      </Helmet>
      
      <h2 className="heading text-2xl font-semibold text-neutral-900 mb-5">Manage Orders</h2>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-5">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
        </TabsList>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-3">
        {isLoadingOrders ? (
          <p className="text-center py-4 text-neutral-500">Loading orders...</p>
        ) : sortedOrders.length > 0 ? (
          sortedOrders.map((order: any) => (
            <OrderItem 
              key={order.id} 
              order={order} 
              isAdmin={true}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border">
            <p className="text-neutral-500">No orders found in this category.</p>
            {activeTab !== "all" && (
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setActiveTab("all")}
              >
                View all orders
              </Button>
            )}
          </div>
        )}
      </div>
      
      <AdminNavigation />
    </div>
  );
}
