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
    queryFn: () => fetch(`/api/categories/${categoryId}/menu-items`).then(res => res.json()),
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

  // Demo menu items for each category
  const demoItems = {
    1: [ // Starters
      {
        id: 101,
        name: "Bruschetta",
        description: "Grilled bread rubbed with garlic and topped with diced tomatoes, fresh basil, and olive oil",
        price: 8.99,
        imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f",
        available: true,
        categoryId: 1
      },
      {
        id: 102,
        name: "Crispy Calamari",
        description: "Lightly battered squid rings served with marinara sauce and lemon wedges",
        price: 12.99,
        imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0",
        available: true,
        categoryId: 1
      }
    ],
    2: [ // Main Courses
      {
        id: 201,
        name: "Grilled Ribeye Steak",
        description: "12oz premium beef served with roasted vegetables and garlic mashed potatoes",
        price: 32.99,
        imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e",
        available: true,
        categoryId: 2
      },
      {
        id: 202,
        name: "Pan-Seared Salmon",
        description: "Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables",
        price: 26.99,
        imageUrl: "https://images.unsplash.com/photo-1485921325833-c519f76c4927",
        available: true,
        categoryId: 2
      }
    ],
    3: [ // Desserts
      {
        id: 301,
        name: "Tiramisu",
        description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream",
        price: 8.99,
        imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
        available: true,
        categoryId: 3
      },
      {
        id: 302,
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
        price: 9.99,
        imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51",
        available: true,
        categoryId: 3
      }
    ],
    4: [ // Drinks
      // Alcoholic Drinks
      {
        id: 401,
        name: "Craft Mojito",
        description: "Fresh mint, lime, rum, and soda water with a hint of sweetness",
        price: 11.99,
        imageUrl: "https://images.unsplash.com/photo-1509961141617-c51d46ef6bfc",
        available: true,
        categoryId: 4,
        subcategory: "Alcohol"
      },
      {
        id: 402,
        name: "House Red Wine",
        description: "Selected premium red wine by the glass",
        price: 8.99,
        imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
        available: true,
        categoryId: 4,
        subcategory: "Alcohol"
      },
      {
        id: 403,
        name: "Craft Beer Selection",
        description: "Local IPA, Stout, or Lager",
        price: 7.99,
        imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9",
        available: true,
        categoryId: 4,
        subcategory: "Alcohol"
      },
      // Non-Alcoholic Drinks
      {
        id: 404,
        name: "Fresh Lemonade",
        description: "Homemade lemonade with mint and honey",
        price: 4.99,
        imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859",
        available: true,
        categoryId: 4,
        subcategory: "Non-Alcohol"
      },
      {
        id: 405,
        name: "Sparkling Water",
        description: "Premium sparkling water with choice of flavoring",
        price: 3.99,
        imageUrl: "https://images.unsplash.com/photo-1598343175492-9e7dc0e63cc2",
        available: true,
        categoryId: 4,
        subcategory: "Non-Alcohol"
      },
      // Tea/Coffee
      {
        id: 406,
        name: "Artisan Coffee",
        description: "Freshly ground premium coffee beans",
        price: 4.50,
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
        available: true,
        categoryId: 4,
        subcategory: "Tea/Coffee"
      },
      {
        id: 407,
        name: "Green Tea",
        description: "Premium Japanese green tea",
        price: 3.99,
        imageUrl: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5",
        available: true,
        categoryId: 4,
        subcategory: "Tea/Coffee"
      },
      // Punch
      {
        id: 408,
        name: "Tropical Punch",
        description: "Blend of tropical fruits with coconut water",
        price: 5.99,
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd",
        available: true,
        categoryId: 4,
        subcategory: "Punch"
      },
      {
        id: 409,
        name: "Berry Blast Punch",
        description: "Mixed berry punch with fresh mint",
        price: 5.99,
        imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e",
        available: true,
        categoryId: 4,
        subcategory: "Punch"
      }
    ]
  };

  if (!items || items.length === 0) {
    // Show demo items for the selected category
    const demoForCategory = categoryId ? demoItems[categoryId] : [];
    
    if (demoForCategory && demoForCategory.length > 0) {
      // Special handling for drinks category (id: 4)
      if (categoryId === 4) {
        const drinkCategories = {
          'Alcohol': demoForCategory.filter(item => item.subcategory === 'Alcohol'),
          'Non-Alcohol': demoForCategory.filter(item => item.subcategory === 'Non-Alcohol'),
          'Tea/Coffee': demoForCategory.filter(item => item.subcategory === 'Tea/Coffee'),
          'Punch': demoForCategory.filter(item => item.subcategory === 'Punch')
        };

        return (
          <div className="p-3">
            {Object.entries(drinkCategories).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item: any) => (
                    <MenuItem key={item.id} {...item} isCompact={true} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="p-3">
          <div className="grid grid-cols-1 gap-4">
            {demoForCategory.map((item: any) => (
              <MenuItem key={item.id} {...item} />
            ))}
          </div>
        </div>
      );
    }
    
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
