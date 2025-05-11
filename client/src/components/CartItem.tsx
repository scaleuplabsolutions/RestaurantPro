import { Plus, Minus } from "lucide-react";
import { useCart, CartItem as CartItemType } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { menuItem, quantity } = item;

  const handleIncrement = () => {
    updateQuantity(menuItem.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      removeItem(menuItem.id);
    } else {
      updateQuantity(menuItem.id, quantity - 1);
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(menuItem.price);

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
      <div className="flex items-center gap-3">
        <div className="bg-neutral-100 w-14 h-14 rounded-md flex items-center justify-center overflow-hidden">
          {menuItem.imageUrl ? (
            <img 
              src={menuItem.imageUrl} 
              alt={menuItem.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2" />
                <path d="M18 15h-8a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z" />
              </svg>
            </span>
          )}
        </div>
        <div>
          <h4 className="font-medium">{menuItem.name}</h4>
          <p className="text-sm text-neutral-500">{formattedPrice}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center"
          onClick={handleDecrement}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="text-sm font-medium w-5 text-center">{quantity}</span>
        <button 
          className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center"
          onClick={handleIncrement}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
