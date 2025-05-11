import Layout from "@/components/Layout";

export default function Breakfast() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Breakfast Menu</h1>
        <p className="text-gray-600 mb-8">Served until 11:00 AM</p>

        <div className="space-y-4">
          {[
            { name: "Farm Fresh Eggs (Any Style)", price: 8.99 },
            { name: "Premium Pork Sausages", price: 7.99 },
            { name: "Homemade Fried Bakes", price: 6.99 },
            { name: "Artisan Toast Bread with Butter", price: 4.99 },
            { name: "Crispy Bacon Strips", price: 7.99 },
          ].map((item) => (
            <div key={item.name} className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-lg text-gray-800">{item.name}</span>
              <span className="text-lg font-medium text-gray-900">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}