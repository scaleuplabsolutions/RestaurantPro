import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

// Form schema for menu item
const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    {
      message: "Price must be a positive number",
    }
  ),
  categoryId: z.string().min(1, "Category is required"),
  available: z.boolean().default(true),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  menuItem?: any;
  onSuccess: () => void;
}

export default function MenuItemForm({ menuItem, onSuccess }: MenuItemFormProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Form setup
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: menuItem?.name || "",
      description: menuItem?.description || "",
      price: menuItem?.price ? menuItem.price.toString() : "",
      categoryId: menuItem?.categoryId ? menuItem.categoryId.toString() : "",
      available: menuItem?.available ?? true,
    },
  });

  // Set image preview when menuItem is provided
  useEffect(() => {
    if (menuItem?.imageUrl) {
      setImagePreview(menuItem.imageUrl);
    }
  }, [menuItem]);

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/menu-items", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create menu item");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu Item Created",
        description: "The menu item has been created successfully.",
      });
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create menu item.",
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await fetch(`/api/menu-items/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update menu item");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu Item Updated",
        description: "The menu item has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update menu item.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: MenuItemFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("categoryId", data.categoryId);
    formData.append("available", data.available.toString());
    
    if (imageFile) {
      formData.append("image", imageFile);
    }
    
    if (menuItem) {
      // Update existing menu item
      await updateMenuItemMutation.mutateAsync({ id: menuItem.id, formData });
    } else {
      // Create new menu item
      await createMenuItemMutation.mutateAsync(formData);
    }
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Grilled Salmon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Fresh Atlantic salmon with asparagus and lemon butter" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <div className="flex">
                    <span className="flex items-center px-3 border border-r-0 bg-muted rounded-l-md">$</span>
                    <Input 
                      className="rounded-l-none" 
                      placeholder="24.99" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : categories && categories.length > 0 ? (
                      categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel className="block mb-2">Image</FormLabel>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden bg-neutral-100">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-neutral-400 text-sm">No image</span>
              )}
            </div>
            <Button type="button" variant="outline" className="relative">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Recommended: 800x500px JPG or PNG
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="available"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
              <div>
                <FormLabel>Available for Order</FormLabel>
                <p className="text-sm text-neutral-500">
                  Toggle to show or hide this item from the menu
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90"
            disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
          >
            {menuItem ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
