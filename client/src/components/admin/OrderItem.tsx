import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistance } from "date-fns";

interface OrderItemProps {
  order: any;
  isAdmin?: boolean;
  onStatusChange?: (orderId: number, status: string) => void;
}

export default function OrderItem({ order, isAdmin = false, onStatusChange }: OrderItemProps) {
  // Get the appropriate badge color based on order status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "out_for_delivery":
        return "accent";
      case "completed":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Format the status text for display
  const formatStatus = (status: string) => {
    switch (status) {
      case "out_for_delivery":
        return "Delivery";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Format the date
  const formatDate = (date: string) => {
    const orderDate = new Date(date);
    return `${orderDate.toLocaleDateString()} at ${orderDate.toLocaleTimeString()}`;
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    if (onStatusChange) {
      onStatusChange(order.id, value);
    }
  };

  return (
    <div className={`border rounded-md p-3 ${
      order.status === "pending" ? "bg-yellow-50 border-yellow-200" : ""
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">Order #{order.id}</p>
            <Badge 
              variant={getBadgeVariant(order.status)}
              className="capitalize"
            >
              {formatStatus(order.status)}
            </Badge>
          </div>
          <p className="text-sm text-neutral-500">
            {formatDate(order.createdAt)} • {
              formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })
            }
          </p>
        </div>
        <span className="font-medium">{formatPrice(order.total)}</span>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <p className="text-sm">{order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}</p>
        
        {isAdmin && (
          <div className="flex gap-2">
            {order.status === "pending" && (
              <>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 h-auto"
                  onClick={() => handleStatusChange("processing")}
                >
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 h-auto"
                  onClick={() => handleStatusChange("cancelled")}
                >
                  Decline
                </Button>
              </>
            )}
            
            {order.status === "processing" && (
              <Button 
                size="sm" 
                variant="secondary"
                className="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 h-auto"
                onClick={() => handleStatusChange(order.deliveryMethod === "delivery" ? "out_for_delivery" : "completed")}
              >
                {order.deliveryMethod === "delivery" ? "Out for Delivery" : "Ready for Pickup"}
              </Button>
            )}
            
            {order.status === "out_for_delivery" && (
              <Button 
                size="sm" 
                variant="secondary"
                className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 px-2 py-1 h-auto"
                onClick={() => handleStatusChange("completed")}
              >
                Mark Delivered
              </Button>
            )}
            
            {/* Status dropdown for admin */}
            {isAdmin && (
              <Select
                defaultValue={order.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
