import { useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import CartItem from "@/components/CartItem";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, CreditCard, BanknoteIcon } from "lucide-react";
import PayPalButton from "@/components/PayPalButton";
import { Helmet } from "react-helmet";

export default function Order() {
  const { items, deliveryMethod, paymentMethod, deliveryAddress, 
          setDeliveryMethod, setPaymentMethod, setDeliveryAddress, 
          subtotal, deliveryFee, tax, total, clearCart } = useCart();
  
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // If cart is empty, redirect to menu
  useEffect(() => {
    if (items.length === 0) {
      setLocation("/");
    }
  }, [items.length, setLocation]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been received and is being processed.",
      });
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setLocation("/profile"); // Redirect to profile to see order
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      setLocation("/profile");
      return;
    }

    if (deliveryMethod === "delivery" && !deliveryAddress) {
      toast({
        title: "Delivery Address Required",
        description: "Please provide a delivery address.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      status: "pending",
      total,
      deliveryMethod,
      deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress : null,
      paymentMethod,
      paymentCompleted: paymentMethod === "cash" ? false : true,
      items: items.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price
      }))
    };

    await createOrderMutation.mutateAsync(orderData);
  };

  // Format prices
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (items.length === 0) {
    return null; // Will redirect to home via useEffect
  }

  return (
    <Layout>
      <Helmet>
        <title>Your Order - Paul's Restaurant</title>
        <meta name="description" content="Complete your food order for pickup or delivery from Paul's Restaurant." />
        <meta property="og:title" content="Your Order - Paul's Restaurant" />
        <meta property="og:description" content="Complete your food order for pickup or delivery from Paul's Restaurant." />
      </Helmet>
      
      <div className="p-4">
        <h2 className="heading text-2xl font-semibold text-neutral-900 mb-4">Your Order</h2>
        
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem key={item.menuItem.id} item={item} />
          ))}
          
          <div className="bg-white border rounded-lg p-4 mt-5">
            <h3 className="font-medium mb-3">Delivery Options</h3>
            <RadioGroup 
              defaultValue={deliveryMethod}
              onValueChange={(value) => setDeliveryMethod(value as "delivery" | "pickup")}
              className="flex gap-3"
            >
              <div className={`flex items-center gap-2 flex-1 border rounded-md p-3 cursor-pointer ${
                deliveryMethod === "delivery" ? "bg-primary/5 border-primary" : ""
              }`}>
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="cursor-pointer">
                  <p className="font-medium text-sm">Delivery</p>
                  <p className="text-xs text-neutral-500">30-45 min</p>
                </Label>
              </div>
              
              <div className={`flex items-center gap-2 flex-1 border rounded-md p-3 cursor-pointer ${
                deliveryMethod === "pickup" ? "bg-primary/5 border-primary" : ""
              }`}>
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="cursor-pointer">
                  <p className="font-medium text-sm">Pickup</p>
                  <p className="text-xs text-neutral-500">15-20 min</p>
                </Label>
              </div>
            </RadioGroup>

            {deliveryMethod === "delivery" && (
              <div className="mt-3">
                <Label htmlFor="address" className="text-sm font-medium">Delivery Address</Label>
                <Input 
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full address"
                  className="mt-1"
                  required
                />
              </div>
            )}
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Delivery Fee</span>
                <span className="font-medium">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tax</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Payment Method</h3>
            <RadioGroup 
              defaultValue={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as "cash" | "paypal")}
              className="space-y-3"
            >
              <div className={`flex items-center justify-between border rounded-md p-3 cursor-pointer ${
                paymentMethod === "cash" ? "bg-primary/5 border-primary" : ""
              }`}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <BanknoteIcon className="h-5 w-5" />
                  <Label htmlFor="cash" className="font-medium text-sm cursor-pointer">Cash on Delivery</Label>
                </div>
              </div>
              
              <div className={`flex items-center justify-between border rounded-md p-3 cursor-pointer ${
                paymentMethod === "paypal" ? "bg-primary/5 border-primary" : ""
              }`}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <CreditCard className="h-5 w-5" />
                  <Label htmlFor="paypal" className="font-medium text-sm cursor-pointer">PayPal</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          {paymentMethod === "paypal" ? (
            <div id="paypal-button" className="mt-6 w-full py-3 bg-primary text-white rounded-md font-semibold flex items-center justify-center gap-2">
              <PayPalButton 
                amount={total.toString()} 
                currency="USD" 
                intent="CAPTURE" 
              />
            </div>
          ) : (
            <Button 
              id="checkout-button" 
              className="mt-6 w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-md font-semibold"
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending || !isAuthenticated}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {createOrderMutation.isPending ? "Processing..." : "Place Order"}
            </Button>
          )}

          {!isAuthenticated && (
            <p className="text-sm text-center text-red-500">
              Please log in to complete your order.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
