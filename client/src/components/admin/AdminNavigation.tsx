import { useLocation } from "wouter";
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Settings } from "lucide-react";

export default function AdminNavigation() {
  const [location, setLocation] = useLocation();

  // Navigation items
  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
    { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  // Check if the current path matches a nav item path
  const isActive = (navPath: string) => {
    if (navPath === "/admin" && location === "/admin") {
      return true;
    }
    if (navPath !== "/admin" && location.startsWith(navPath)) {
      return true;
    }
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 max-w-md mx-auto z-50">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`flex flex-col items-center py-1 ${
            isActive(item.path) ? "text-primary" : "text-neutral-400"
          }`}
          onClick={() => setLocation(item.path)}
        >
          <item.icon size={20} />
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
