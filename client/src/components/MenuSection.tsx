import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
      <div className="p-4">
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-40 h-16 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 justify-between">
        {categories && categories.map((category: any) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`
              flex-1 h-12 rounded-lg shadow-md transition-all transform hover:-translate-y-1
              ${activeCategory === category.id 
                ? 'bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300'
                : 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300'}
            `}
          >
            <div className="flex items-center justify-center">
              <h2 className={`font-semibold text-sm ${activeCategory === category.id ? 'text-purple-800' : 'text-gray-800'}`}>
                {category.name}
              </h2>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}