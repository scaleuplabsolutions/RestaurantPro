import { useLocation } from "wouter";
import { 
  Home, 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  User 
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { cartCount } = useCart();

  // Navigation items
  const navItems = [
    { path: "/", label: "Menu", icon: Home },
    { path: "/order", label: "Order", icon: ShoppingBag, badge: cartCount > 0 ? cartCount : null },
    { path: "/reservation", label: "Reserve", icon: Calendar },
    { path: "/contact", label: "Contact", icon: MapPin },
    { path: "/profile", label: "Profile", icon: User },
  ];

  // Check if the current path matches a nav item path
  const isActive = (navPath: string) => {
    if (navPath === "/" && location === "/") {
      return true;
    }
    if (navPath !== "/" && location.startsWith(navPath)) {
      return true;
    }
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 max-w-md mx-auto z-50">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`bottom-nav-item flex flex-col items-center py-1 ${
            isActive(item.path) ? "active text-primary" : "text-neutral-400"
          }`}
          onClick={() => setLocation(item.path)}
        >
          <div className="relative">
            <item.icon size={20} />
            {item.badge && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {item.badge}
              </Badge>
            )}
          </div>
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
