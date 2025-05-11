import { useQuery } from "@tanstack/react-query";
import MenuItem from "./MenuItem";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemsProps {
  categoryId: number | null;
}

export default function MenuItems({ categoryId }: MenuItemsProps) {
  // Fetch all menu items
  const { data: allItems, isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/menu-items'],
  });

  // Fetch category-specific menu items if a category is selected
  const { data: categoryItems, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['/api/categories', categoryId, 'menu-items'],
    enabled: categoryId !== null,
  });

  const isLoading = categoryId === null ? isLoadingAll : isLoadingCategory;
  const items = categoryId === null ? allItems : categoryItems;

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-3">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5 mb-3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="p-3">
        <div className="text-center py-10">
          <p className="text-neutral-500">No menu items found in this category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="grid grid-cols-1 gap-4">
        {items.map((item: any) => (
          <MenuItem 
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            imageUrl={item.imageUrl}
            available={item.available}
            categoryId={item.categoryId}
          />
        ))}
      </div>
    </div>
  );
}
