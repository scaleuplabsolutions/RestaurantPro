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
      
      <MenuSection onCategoryChange={setSelectedCategory} />
      <MenuItems categoryId={selectedCategory} />
    </Layout>
  );
}
