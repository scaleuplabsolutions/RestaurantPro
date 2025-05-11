
import Layout from "@/components/Layout";
import MenuItem from "@/components/MenuItem";
import { useQuery } from "@tanstack/react-query";

export default function Breakfast() {
  const { data: menuItems = [] } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const response = await fetch("/api/categories/1/menu-items");
      return response.json();
    },
  });

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Breakfast Menu</h1>
        <p className="text-gray-600 mb-8">Served until 11:00 AM</p>
        <div className="grid grid-cols-1 gap-4">
          <MenuItem
            id={1}
            name="Classic American Breakfast"
            description="Two eggs any style, bacon or sausage, hash browns, and toast"
            price={12.99}
            imageUrl="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666"
            available={true}
            categoryId={1}
          />
          <MenuItem
            id={2}
            name="Belgian Waffles"
            description="Served with maple syrup, whipped cream, and fresh berries"
            price={10.99}
            imageUrl="https://images.unsplash.com/photo-1562376552-0d160a2f238d"
            available={true}
            categoryId={1}
          />
          <MenuItem
            id={3}
            name="Eggs Benedict"
            description="Poached eggs on English muffin with hollandaise sauce"
            price={14.99}
            imageUrl="https://images.unsplash.com/photo-1608039829572-78524f79c4c7"
            available={true}
            categoryId={1}
          />
        </div>
      </div>
    </Layout>
  );
}
