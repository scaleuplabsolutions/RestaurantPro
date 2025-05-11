import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const reservationSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  partySize: z.string().min(1, "Party size is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  specialRequests: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

export default function ReservationForm() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      partySize: "",
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      specialRequests: "",
    },
  });

  const reservationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/reservations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reservation Confirmed",
        description: "Your table has been reserved successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/reservations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Reservation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ReservationFormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a reservation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert form data to the format expected by the API
      const reservationData = {
        date: `${data.date}T${data.time}:00`,
        partySize: parseInt(data.partySize),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        specialRequests: data.specialRequests || "",
        status: "pending"
      };

      await reservationMutation.mutateAsync(reservationData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots for the select dropdown
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 17; h <= 21; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h < 10 ? `0${h}` : `${h}`;
        const minute = m === 0 ? "00" : `${m}`;
        const time = `${hour}:${minute}`;
        const label = `${h % 12 === 0 ? 12 : h % 12}:${minute} ${h >= 12 ? 'PM' : 'AM'}`;
        slots.push({ value: time, label });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-3">Reservation Details</h3>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Date</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="date" 
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="partySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Party Size</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select number of guests" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 person</SelectItem>
                      <SelectItem value="2">2 people</SelectItem>
                      <SelectItem value="3">3 people</SelectItem>
                      <SelectItem value="4">4 people</SelectItem>
                      <SelectItem value="5">5 people</SelectItem>
                      <SelectItem value="6">6 people</SelectItem>
                      <SelectItem value="7">7 people</SelectItem>
                      <SelectItem value="8">8+ people</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-3">Contact Information</h3>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                      placeholder="John Doe" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                      placeholder="(123) 456-7890" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                      placeholder="johndoe@example.com" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                      placeholder="e.g., Preferred seating area, dietary restrictions, etc." 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-md font-semibold"
          disabled={isSubmitting || !isAuthenticated}
        >
          {isSubmitting ? "Processing..." : "Confirm Reservation"}
        </Button>
        
        {!isAuthenticated && (
          <p className="text-sm text-center text-red-500">
            Please log in to make a reservation.
          </p>
        )}
      </form>
    </Form>
  );
}
