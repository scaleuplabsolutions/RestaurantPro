import { useState } from "react";
import Layout from "@/components/Layout";
import RestaurantBanner from "@/components/RestaurantBanner";
import SpecialBanner from "@/components/SpecialBanner";
import MenuSection from "@/components/MenuSection";
import MenuItems from "@/components/MenuItems";
import { Helmet } from "react-helmet";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  return (
    <Layout>
      <Helmet>
        <title>Paul's Restaurant - Menu</title>
        <meta name="description" content="Explore our delicious menu with fresh ingredients and gourmet dishes. Order online for pickup or delivery." />
        <meta property="og:title" content="Paul's Restaurant - Menu" />
        <meta property="og:description" content="Explore our delicious menu with fresh ingredients and gourmet dishes. Order online for pickup or delivery." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300" />
      </Helmet>
      
      <RestaurantBanner />
      <SpecialBanner />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-2">Breakfast</h2>
          <p className="text-gray-600 mb-4">Start your day with our delicious breakfast options</p>
          <p className="text-sm text-gray-500">Served until 11:00 AM</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-2">Lunch</h2>
          <p className="text-gray-600 mb-4">Enjoy our fresh and satisfying lunch menu</p>
          <p className="text-sm text-gray-500">Served 11:00 AM - 3:00 PM</p>
        </div>
      </div>
      
      <MenuSection onCategoryChange={setSelectedCategory} />
      <MenuItems categoryId={selectedCategory} />
    </Layout>
  );
}
