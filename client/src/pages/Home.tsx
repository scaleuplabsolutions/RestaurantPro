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
        <div 
          onClick={() => {
            setSelectedCategory(1); // Assuming 1 is breakfast category ID
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }}
          className="cursor-pointer bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-orange-300"
        >
          <h2 className="text-2xl font-semibold mb-2 text-orange-800">Breakfast</h2>
          <p className="text-orange-700 mb-4">Start your day with our delicious breakfast options</p>
          <p className="text-sm text-orange-600">Served until 11:00 AM</p>
          <div className="mt-4 text-orange-700">
            <span className="flex items-center">
              View Menu 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
        <div 
          onClick={() => {
            setSelectedCategory(2); // Assuming 2 is lunch category ID
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }}
          className="cursor-pointer bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-blue-300"
        >
          <h2 className="text-2xl font-semibold mb-2 text-blue-800">Lunch</h2>
          <p className="text-blue-700 mb-4">Enjoy our fresh and satisfying lunch menu</p>
          <p className="text-sm text-blue-600">Served 11:00 AM - 3:00 PM</p>
          <div className="mt-4 text-blue-700">
            <span className="flex items-center">
              View Menu 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      
      <MenuSection onCategoryChange={setSelectedCategory} />
      <MenuItems categoryId={selectedCategory} />
    </Layout>
  );
}
