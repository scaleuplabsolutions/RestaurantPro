import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuSectionProps {
  onCategoryChange: (categoryId: number | null) => void;
}

export default function MenuSection({ onCategoryChange }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const handleCategoryClick = (categoryId: number | null) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
  };

  if (isLoading) {
    return (
      <div className="p-3 border-b">
        <ScrollArea className="whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-20 rounded-full" />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="p-3 border-b">
      <ScrollArea className="whitespace-nowrap">
        <div className="flex gap-2 pb-2 no-scrollbar">
          <Button
            variant={activeCategory === null ? "default" : "secondary"}
            className={`rounded-full px-4 py-2 h-auto ${
              activeCategory === null 
                ? "bg-primary text-white hover:bg-primary/90" 
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
            onClick={() => handleCategoryClick(null)}
          >
            All
          </Button>
          
          {categories && categories.map((category: any) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "secondary"}
              className={`rounded-full px-4 py-2 h-auto ${
                activeCategory === category.id 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
