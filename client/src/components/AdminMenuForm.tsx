import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, AlertCircle } from "lucide-react";

// Form schema for category
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface AdminMenuFormProps {
  onSuccess: () => void;
  category?: any;
}

export default function AdminMenuForm({ onSuccess, category }: AdminMenuFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
    },
  });

  // Update form when category prop changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
      });
    }
  }, [category, form]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Category Created",
        description: "The new category has been created successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "There was an error creating the category.",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await apiRequest("PUT", `/api/categories/${category.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Category Updated",
        description: "The category has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the category.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (category) {
        await updateCategoryMutation.mutateAsync(data);
      } else {
        await createCategoryMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
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
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Starters, Main Courses, Desserts" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-white hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? "Saving..." 
              : category 
                ? "Update Category" 
                : "Create Category"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
