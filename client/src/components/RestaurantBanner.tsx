import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantBanner() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  if (isLoading) {
    return (
      <div className="relative h-48">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  const restaurantName = settings?.name || "Paul's Restaurant";

  return (
    <div 
      className="relative h-48 bg-cover bg-center" 
      style={{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300')` 
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
        <div className="absolute bottom-0 left-0 p-4">
          <h1 className="heading text-white text-3xl font-bold">{restaurantName}</h1>
          <p className="text-white/90 text-sm">Fine Dining & Gourmet Experience</p>
        </div>
      </div>
    </div>
  );
}
