
import Layout from "@/components/Layout";
import MenuItem from "@/components/MenuItem";
import { useQuery } from "@tanstack/react-query";

export default function Lunch() {
  const { data: menuItems = [] } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const response = await fetch("/api/categories/2/menu-items");
      return response.json();
    },
  });

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Lunch Menu</h1>
        <p className="text-gray-600 mb-4">Served 11:00 AM - 3:00 PM</p>
        
        <div className="mb-8">
          <a href="/combos" className="block bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-yellow-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-yellow-800">Daily Lunch Combos</h2>
                <p className="text-yellow-700 mt-1">Special combinations at great prices!</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <MenuItem
            id={4}
            name="Grilled Chicken Caesar"
            description="Romaine lettuce, grilled chicken, parmesan, croutons"
            price={15.99}
            imageUrl="https://images.unsplash.com/photo-1550304943-4f24f54ddde9"
            available={true}
            categoryId={2}
          />
          <MenuItem
            id={5}
            name="Classic Burger"
            description="Angus beef patty, lettuce, tomato, cheese, special sauce"
            price={16.99}
            imageUrl="https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
            available={true}
            categoryId={2}
          />
          <MenuItem
            id={6}
            name="Grilled Salmon"
            description="Fresh salmon with quinoa and roasted vegetables"
            price={19.99}
            imageUrl="https://images.unsplash.com/photo-1467003909585-2f8a72700288"
            available={true}
            categoryId={2}
          />
        </div>
      </div>
    </Layout>
  );
}
