
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
        <p className="text-gray-600 mb-8">Served 11:00 AM - 3:00 PM</p>
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
