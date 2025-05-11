import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import { useQuery } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserIcon, LogOut, ChevronsRight, Lock, Bell, MapPin, CreditCard } from "lucide-react";
import { Helmet } from "react-helmet";

export default function Profile() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
  });

  const handleLogout = async () => {
    await logout();
  };

  const goToAdmin = () => {
    setLocation("/admin");
  };

  const profileContent = isAuthenticated ? (
    <div id="logged-in-view">
      <Helmet>
        <title>My Profile - Paul's Restaurant</title>
        <meta name="description" content="Manage your profile, view order history, and access account settings." />
        <meta property="og:title" content="My Profile - Paul's Restaurant" />
        <meta property="og:description" content="Manage your profile, view order history, and access account settings." />
      </Helmet>
      
      <div className="bg-white border rounded-lg p-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <UserIcon className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-medium text-lg">{user?.fullName}</h3>
          <p className="text-sm text-neutral-500">{user?.email}</p>
          {isAdmin && (
            <Badge variant="secondary" className="mt-1">
              Admin
            </Badge>
          )}
        </div>
      </div>
      
      {isAdmin && (
        <Button 
          className="mt-4 w-full py-2 bg-secondary hover:bg-secondary/90 text-white"
          onClick={goToAdmin}
        >
          Go to Admin Dashboard
        </Button>
      )}
      
      <div className="bg-white border rounded-lg p-4 mt-4">
        <h3 className="font-medium mb-3">Account Settings</h3>
        
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 text-left border-b">
            <div className="flex items-center gap-3">
              <UserIcon className="text-neutral-500 h-5 w-5" />
              <span>Edit Profile</span>
            </div>
            <ChevronsRight className="text-neutral-400 h-5 w-5" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 text-left border-b">
            <div className="flex items-center gap-3">
              <Lock className="text-neutral-500 h-5 w-5" />
              <span>Change Password</span>
            </div>
            <ChevronsRight className="text-neutral-400 h-5 w-5" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 text-left border-b">
            <div className="flex items-center gap-3">
              <Bell className="text-neutral-500 h-5 w-5" />
              <span>Notification Settings</span>
            </div>
            <ChevronsRight className="text-neutral-400 h-5 w-5" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 text-left border-b">
            <div className="flex items-center gap-3">
              <MapPin className="text-neutral-500 h-5 w-5" />
              <span>Delivery Addresses</span>
            </div>
            <ChevronsRight className="text-neutral-400 h-5 w-5" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 text-left border-b">
            <div className="flex items-center gap-3">
              <CreditCard className="text-neutral-500 h-5 w-5" />
              <span>Payment Methods</span>
            </div>
            <ChevronsRight className="text-neutral-400 h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg p-4 mt-4">
        <h3 className="font-medium mb-3">Order History</h3>
        
        {isLoadingOrders ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32 mt-2" />
                <Skeleton className="h-4 w-20 mt-2" />
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div key={order.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge 
                    variant={order.status === 'completed' ? 'success' : 
                           order.status === 'cancelled' ? 'destructive' : 
                           'secondary'}
                    className="capitalize"
                  >
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm mt-2">
                  {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} • 
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(order.total)}
                </p>
                <button className="text-primary text-sm mt-2 font-medium">View Details</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">You have no orders yet.</p>
        )}
      </div>
      
      <Button 
        onClick={handleLogout}
        className="mt-6 w-full py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-md font-semibold"
      >
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </Button>
    </div>
  ) : (
    <div id="login-view">
      <Helmet>
        <title>Login - Paul's Restaurant</title>
        <meta name="description" content="Sign in to your account or create a new one to order food and make reservations." />
        <meta property="og:title" content="Login - Paul's Restaurant" />
        <meta property="og:description" content="Sign in to your account or create a new one to order food and make reservations." />
      </Helmet>
      
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm onSignupSuccess={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="p-4">
        <h2 className="heading text-2xl font-semibold text-neutral-900 mb-5">My Profile</h2>
        
        {profileContent}
      </div>
    </Layout>
  );
}
