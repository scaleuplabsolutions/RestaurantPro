import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import AdminNavigation from "@/components/admin/AdminNavigation";
import MenuItemForm from "@/components/admin/MenuItemForm";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Edit, 
  Trash2,

} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Helmet } from "react-helmet";

export default function AdminMenuManagement() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);

  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      setLocation("/");
    } else if (!isAuthenticated) {
      setLocation("/profile");
    }
  }, [isAdmin, isAuthenticated, setLocation]);

  // Fetch menu items
  const { data: menuItems = [], isLoading: isLoadingMenuItems } = useQuery({
    queryKey: ['/api/menu-items'],
    enabled: isAdmin,
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (menuItemId: number) => {
      const response = await apiRequest("DELETE", `/api/menu-items/${menuItemId}`, null);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu Item Deleted",
        description: "The menu item has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete menu item.",
        variant: "destructive",
      });
    },
  });

  const handleAddMenuItem = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditMenuItem = (menuItem: any) => {
    setSelectedMenuItem(menuItem);
    setIsEditDialogOpen(true);
  };

  const handleDeleteMenuItem = async (menuItemId: number) => {
    await deleteMenuItemMutation.mutateAsync(menuItemId);
  };

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="p-4 pb-20">
      <Helmet>
        <title>Menu Management - Admin Dashboard</title>
        <meta name="description" content="Manage your restaurant menu items. Add, edit, or remove dishes from your menu." />
      </Helmet>
      
      <div className="flex items-center justify-between mb-5">
        <h2 className="heading text-2xl font-semibold text-neutral-900">Manage Menu</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleAddMenuItem}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
            </DialogHeader>
            <MenuItemForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white border rounded-lg p-4">
        {isLoadingMenuItems ? (
          <p className="text-sm text-neutral-500">Loading menu items...</p>
        ) : menuItems.length > 0 ? (
          <div className="space-y-3">
            {menuItems.map((menuItem: any) => (
              <div key={menuItem.id} className="border rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-100 rounded-md flex items-center justify-center overflow-hidden">
                    {menuItem.imageUrl ? (
                      <img 
                        src={menuItem.imageUrl} 
                        alt={menuItem.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-neutral-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                          <path d="M7 2v20" />
                          <path d="M21 15V2" />
                          <path d="M18 15h-8a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{menuItem.name}</p>
                    <p className="text-sm text-neutral-500">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(menuItem.price)} • {
                        menuItem.available ? 'Available' : 'Unavailable'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isEditDialogOpen && selectedMenuItem?.id === menuItem.id} onOpenChange={(open) => {
                    if (!open) setSelectedMenuItem(null);
                    setIsEditDialogOpen(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        onClick={() => handleEditMenuItem(menuItem)}
                      >
                        <Edit className="h-4 w-4 text-neutral-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Menu Item</DialogTitle>
                      </DialogHeader>
                      {selectedMenuItem && (
                        <MenuItemForm 
                          menuItem={selectedMenuItem}
                          onSuccess={() => {
                            setIsEditDialogOpen(false);
                            setSelectedMenuItem(null);
                            queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
                          }} 
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="w-8 h-8 rounded-full"
                      >
                        <Trash2 className="h-4 w-4 text-neutral-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{menuItem.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDeleteMenuItem(menuItem.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No menu items yet. Add your first item!</p>
        )}
      </div>
      
      <AdminNavigation />
    </div>
  );
}
