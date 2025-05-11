
import Layout from "@/components/Layout";
import MenuItem from "@/components/MenuItem";

export default function Combos() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Lunch Combos</h1>
        <p className="text-gray-600 mb-8">Available daily from 11:00 AM - 3:00 PM</p>
        <div className="grid grid-cols-1 gap-4">
          <MenuItem
            id={601}
            name="Power Lunch Combo"
            description="Grilled chicken breast, side salad, soup of the day, and iced tea"
            price={18.99}
            imageUrl="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
            available={true}
            categoryId={2}
            isCompact={true}
          />
          <MenuItem
            id={602}
            name="Executive Combo"
            description="Premium steak, roasted vegetables, mashed potatoes, and dessert"
            price={24.99}
            imageUrl="https://images.unsplash.com/photo-1544025162-d76694265947"
            available={true}
            categoryId={2}
            isCompact={true}
          />
          <MenuItem
            id={603}
            name="Vegetarian Delight Combo"
            description="Quinoa bowl, vegetable soup, fresh fruit, and kombucha"
            price={16.99}
            imageUrl="https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
            available={true}
            categoryId={2}
            isCompact={true}
          />
        </div>
      </div>
    </Layout>
  );
}
