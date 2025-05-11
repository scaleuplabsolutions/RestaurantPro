
import Layout from "@/components/Layout";
import RestaurantBanner from "@/components/RestaurantBanner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function Breakfast() {
  const { addItem } = useCart();

  const menuItems = [
    { id: 1, name: "Farm Fresh Eggs (Any Style)", price: 8.99, description: "Farm fresh eggs cooked to your preference", imageUrl: "https://images.unsplash.com/photo-1608797178974-15b35a64ede5?w=500", available: true, categoryId: 1 },
    { id: 2, name: "Premium Pork Sausages", price: 7.99, description: "Grilled premium pork sausages", imageUrl: "https://images.unsplash.com/photo-1623062553798-7866144n3b34?w=500", available: true, categoryId: 1 },
    { id: 3, name: "Homemade Fried Bakes", price: 6.99, description: "Traditional fried bakes, served hot", imageUrl: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=500", available: true, categoryId: 1 },
    { id: 4, name: "Artisan Toast Bread with Butter", price: 4.99, description: "Freshly baked artisan bread, toasted and served with butter", imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500", available: true, categoryId: 1 },
    { id: 5, name: "Crispy Bacon Strips", price: 7.99, description: "Crispy fried bacon strips", imageUrl: "https://images.unsplash.com/photo-1542203519-615a6e53d141?w=500", available: true, categoryId: 1 },
  ];

  return (
    <Layout>
      <RestaurantBanner />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Breakfast Menu</h1>
        <p className="text-gray-600 mb-8">Served until 11:00 AM</p>

        <div className="space-y-4">
          {menuItems.map((item) => (
            <div key={item.name} className="flex justify-between items-center border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <Button 
                onClick={() => addItem(item)}
                className="ml-4"
              >
                Add to Order
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
