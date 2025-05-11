import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HandPlatter, 
  Palette, 
  Clock, 
  CreditCard, 
  Upload,
  LogOut
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Helmet } from "react-helmet";

// Form schema for restaurant details
const restaurantSettingsSchema = z.object({
  name: z.string().min(1, "HandPlatter name is required"),
  primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid color format"),
});

type RestaurantSettingsValues = z.infer<typeof restaurantSettingsSchema>;

export default function AdminSettings() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      setLocation("/");
    } else if (!isAuthenticated) {
      setLocation("/profile");
    }
  }, [isAdmin, isAuthenticated, setLocation]);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    enabled: isAdmin,
  });

  // Form setup
  const form = useForm<RestaurantSettingsValues>({
    resolver: zodResolver(restaurantSettingsSchema),
    defaultValues: {
      name: settings?.name || "",
      primaryColor: settings?.primaryColor || "#8D4E00",
    },
    values: {
      name: settings?.name || "",
      primaryColor: settings?.primaryColor || "#8D4E00",
    },
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        name: settings.name,
        primaryColor: settings.primaryColor || "#8D4E00",
      });
      
      if (settings.logoUrl) {
        setLogoPreview(settings.logoUrl);
      }
    }
  }, [settings, form]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/settings", {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update settings");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your restaurant settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  // Handle file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission
  const onSubmit = async (data: RestaurantSettingsValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("primaryColor", data.primaryColor);
    
    if (logoFile) {
      formData.append("logo", logoFile);
    }
    
    await updateSettingsMutation.mutateAsync(formData);
  };

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="p-4 pb-20">
      <Helmet>
        <title>Settings - Admin Dashboard</title>
        <meta name="description" content="Configure your restaurant settings, customize theme, and manage operational parameters." />
      </Helmet>
      
      <h2 className="heading text-2xl font-semibold text-neutral-900 mb-5">Settings</h2>
      
      <Tabs defaultValue="restaurant" className="mb-5">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="restaurant">
            <HandPlatter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">HandPlatter</span>
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="restaurant">
          {isLoading ? (
            <p className="text-center py-4">Loading settings...</p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HandPlatter Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Paul's HandPlatter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <Label htmlFor="logo" className="block mb-2">HandPlatter Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border rounded-md flex items-center justify-center overflow-hidden bg-neutral-100">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <HandPlatter className="h-8 w-8 text-neutral-400" />
                      )}
                    </div>
                    <div>
                      <Button type="button" variant="outline" className="relative" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                        <input
                          id="logo"
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={handleLogoChange}
                        />
                      </Button>
                      <p className="text-xs text-neutral-500 mt-1">
                        Recommended: 512x512px PNG or JPG
                      </p>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 w-full mt-4"
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          )}
        </TabsContent>
        
        <TabsContent value="theme">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium mb-4">Theme Customization</h3>
            <p className="text-sm text-neutral-500">
              Theme customization features will be available in a future update.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border rounded-md p-3 flex flex-col items-center">
                <div className="w-full h-24 rounded-md bg-primary mb-2"></div>
                <p className="text-sm font-medium">Current Theme</p>
              </div>
              
              <div className="border rounded-md p-3 flex flex-col items-center bg-neutral-100">
                <div className="w-full h-24 rounded-md bg-neutral-200 mb-2 flex items-center justify-center">
                  <span className="text-neutral-400 text-sm">Coming Soon</span>
                </div>
                <p className="text-sm font-medium text-neutral-400">Dark Theme</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="hours">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium mb-4">Opening Hours</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Monday</span>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="11:00" className="w-24" />
                  <span className="text-neutral-500">to</span>
                  <Input type="time" defaultValue="22:00" className="w-24" />
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Tuesday</span>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="11:00" className="w-24" />
                  <span className="text-neutral-500">to</span>
                  <Input type="time" defaultValue="22:00" className="w-24" />
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Wednesday</span>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="11:00" className="w-24" />
                  <span className="text-neutral-500">to</span>
                  <Input type="time" defaultValue="22:00" className="w-24" />
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Thursday</span>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="11:00" className="w-24" />
                  <span className="text-neutral-500">to</span>
                  <Input type="time" defaultValue="22:00" className="w-24" />
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Friday</span>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="11:00" className="w-24" />
                  <span className="text-neutral-500">to</span>
                  <Input type="time" defaultValue="23:00" className="w-24" />
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Saturday</span>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="11:00" className="w-24" />
                  <span className="text-neutral-500">to</span>
                  <Input type="time" defaultValue="23:00" className="w-24" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Sunday</span>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="12:00" className="w-24" />
                  <span className="text-neutral-500">to</span>
                  <Input type="time" defaultValue="22:00" className="w-24" />
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
              Save Opening Hours
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="payment">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium mb-4">Payment Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="block mb-2">Accept PayPal Payments</Label>
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="PayPal Client ID" className="flex-1" />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Enter your PayPal Client ID to enable PayPal payments.
                </p>
              </div>
              
              <div>
                <Label className="block mb-2">Minimum Order Amount</Label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-neutral-100 border border-r-0 rounded-l-md">$</span>
                  <Input type="number" defaultValue="10" min="0" className="rounded-l-none" />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Minimum amount required for an order to be placed.
                </p>
              </div>
              
              <div>
                <Label className="block mb-2">Free Delivery Threshold</Label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-neutral-100 border border-r-0 rounded-l-md">$</span>
                  <Input type="number" defaultValue="35" min="0" className="rounded-l-none" />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Order amount above which delivery is free.
                </p>
              </div>
            </div>
            
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
              Save Payment Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 mb-20">
        <Button 
          onClick={logout}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
      
      <AdminNavigation />
    </div>
  );
}
