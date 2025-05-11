import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface MenuItemProps {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  categoryId: number;
}

export default function MenuItem({
  id,
  name,
  description,
  price,
  imageUrl,
  available,
}: MenuItemProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id,
      name,
      description,
      price,
      imageUrl,
      available,
      categoryId: 0,
    });
    
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300";

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="relative">
        <img 
          src={imageUrl || defaultImage} 
          alt={name} 
          className="w-full h-40 object-cover"
        />
        {!available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold">Currently Unavailable</span>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-neutral-900">{name}</h3>
            <p className="text-sm text-neutral-500 mt-1">{description}</p>
          </div>
          <span className="font-semibold text-primary">{formattedPrice}</span>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={!available || isAdding}
          className="mt-3 w-full py-2 bg-primary hover:bg-primary/90 text-white"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAdding ? "Added!" : "Add to Order"}
        </Button>
      </CardContent>
    </Card>
  );
}
