import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MenuItem from "./MenuItem";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemsProps {
  categoryId: number | null;
}

// Define drink subcategory types
type DrinkType = 'alcohol' | 'non-alcohol' | 'tea-coffee' | 'punch' | null;

export default function MenuItems({ categoryId }: MenuItemsProps) {
  const [drinkType, setDrinkType] = useState<DrinkType>(null);
  
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
  
  // Check if this is the Drinks category (ID: 4)
  const isDrinksCategory = categoryId === 4;
  
  // Define drink subcategories with their UI elements
  const drinkSubcategories = [
    { id: 'alcohol' as DrinkType, name: 'Alcohol', icon: '🍷' },
    { id: 'non-alcohol' as DrinkType, name: 'Non-Alcohol', icon: '🧃' },
    { id: 'tea-coffee' as DrinkType, name: 'Tea/Coffee', icon: '☕' },
    { id: 'punch' as DrinkType, name: 'Punch', icon: '🍹' }
  ];

  // Demo menu items for each category
  const demoItems: Record<number, Array<any>> = {
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
    4: [ // Drinks with subcategory property
      {
        id: 401,
        name: "Craft Mojito",
        description: "Fresh mint, lime, rum, and soda water with a hint of sweetness",
        price: 11.99,
        imageUrl: "https://images.unsplash.com/photo-1509961141617-c51d46ef6bfc",
        available: true,
        categoryId: 4,
        subcategory: "alcohol" // Matches the DrinkType
      },
      {
        id: 402,
        name: "House Red Wine",
        description: "Selected premium red wine by the glass",
        price: 8.99,
        imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
        available: true,
        categoryId: 4,
        subcategory: "alcohol"
      },
      {
        id: 403,
        name: "Craft Beer Selection",
        description: "Local IPA, Stout, or Lager",
        price: 7.99,
        imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9",
        available: true,
        categoryId: 4,
        subcategory: "alcohol"
      },
      {
        id: 404,
        name: "Fresh Lemonade",
        description: "Homemade lemonade with mint and honey",
        price: 4.99,
        imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859",
        available: true,
        categoryId: 4,
        subcategory: "non-alcohol"
      },
      {
        id: 405,
        name: "Sparkling Water",
        description: "Premium sparkling water with choice of flavoring",
        price: 3.99,
        imageUrl: "https://images.unsplash.com/photo-1598343175492-9e7dc0e63cc2",
        available: true,
        categoryId: 4,
        subcategory: "non-alcohol"
      },
      {
        id: 406,
        name: "Artisan Coffee",
        description: "Freshly ground premium coffee beans",
        price: 4.50,
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
        available: true,
        categoryId: 4,
        subcategory: "tea-coffee"
      },
      {
        id: 407,
        name: "Green Tea",
        description: "Premium Japanese green tea",
        price: 3.99,
        imageUrl: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5",
        available: true,
        categoryId: 4,
        subcategory: "tea-coffee"
      },
      {
        id: 408,
        name: "Tropical Punch",
        description: "Blend of tropical fruits with coconut water",
        price: 5.99,
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd",
        available: true,
        categoryId: 4,
        subcategory: "punch"
      },
      {
        id: 409,
        name: "Berry Blast Punch",
        description: "Mixed berry punch with fresh mint",
        price: 5.99,
        imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e",
        available: true,
        categoryId: 4,
        subcategory: "punch"
      }
    ]
  };

  // Render loading skeleton
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

  // Render the drinks submenu
  const DrinkSubmenu = () => {
    if (!isDrinksCategory) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Drink Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {drinkSubcategories.map((subcat) => (
            <button
              key={subcat.id}
              onClick={() => setDrinkType(drinkType === subcat.id ? null : subcat.id)}
              className={`
                p-3 rounded-md text-sm font-medium transition-all shadow-sm
                ${drinkType === subcat.id 
                  ? 'bg-purple-100 border border-purple-300 text-purple-800' 
                  : 'bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200'}
              `}
            >
              <span className="block text-xl mb-1">{subcat.icon}</span>
              {subcat.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Use demo items if no real items are available
  if (!items || items.length === 0) {
    const demoForCategory = categoryId ? demoItems[categoryId] || [] : [];
    
    if (demoForCategory.length === 0) {
      return (
        <div className="p-3">
          {isDrinksCategory && <DrinkSubmenu />}
          <div className="text-center py-10">
            <p className="text-neutral-500">No menu items found in this category.</p>
          </div>
        </div>
      );
    }
    
    // Filter demo items by drink type if applicable
    const filteredDemoItems = isDrinksCategory && drinkType
      ? demoForCategory.filter(item => item.subcategory === drinkType)
      : demoForCategory;
      
    return (
      <div className="p-3">
        {isDrinksCategory && <DrinkSubmenu />}
        
        <div className="grid grid-cols-1 gap-4">
          {filteredDemoItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-neutral-500">
                {isDrinksCategory && drinkType 
                  ? `No ${drinkType} drinks found.` 
                  : "No items found in this category."}
              </p>
            </div>
          ) : (
            filteredDemoItems.map((item: any) => (
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
            ))
          )}
        </div>
      </div>
    );
  }

  // Filter real items by drink type if applicable
  const filteredItems = isDrinksCategory && drinkType
    ? items.filter((item: any) => {
        const name = item.name.toLowerCase();
        const description = (item.description || '').toLowerCase();
        
        switch(drinkType) {
          case 'alcohol':
            return name.includes('wine') || name.includes('beer') || 
                   name.includes('cocktail') || name.includes('liquor') ||
                   name.includes('mojito') || description.includes('rum');
          case 'non-alcohol':
            return name.includes('juice') || name.includes('soda') || 
                   name.includes('water') || name.includes('lemonade');
          case 'tea-coffee':
            return name.includes('tea') || name.includes('coffee') || 
                   name.includes('espresso') || name.includes('latte');
          case 'punch':
            return name.includes('punch');
          default:
            return true;
        }
      })
    : items;

  // Render the full component with real data
  return (
    <div className="p-3">
      {isDrinksCategory && <DrinkSubmenu />}
      
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-neutral-500">
              {isDrinksCategory && drinkType 
                ? `No ${drinkType} drinks found.` 
                : "No items found in this category."}
            </p>
          </div>
        ) : (
          filteredItems.map((item: any) => (
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
          ))
        )}
      </div>
    </div>
  );
}