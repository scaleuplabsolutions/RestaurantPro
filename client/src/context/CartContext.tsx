import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  deliveryMethod: "delivery" | "pickup";
  paymentMethod: "cash" | "paypal";
  deliveryAddress?: string;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: MenuItem }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "SET_DELIVERY_METHOD"; payload: "delivery" | "pickup" }
  | { type: "SET_PAYMENT_METHOD"; payload: "cash" | "paypal" }
  | { type: "SET_DELIVERY_ADDRESS"; payload: string }
  | { type: "CLEAR_CART" };

interface CartContextType extends CartState {
  addItem: (item: MenuItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  setDeliveryMethod: (method: "delivery" | "pickup") => void;
  setPaymentMethod: (method: "cash" | "paypal") => void;
  setDeliveryAddress: (address: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  deliveryMethod: "delivery",
  paymentMethod: "cash",
  deliveryAddress: "",
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  setDeliveryMethod: () => {},
  setPaymentMethod: () => {},
  setDeliveryAddress: () => {},
  clearCart: () => {},
  cartCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
});

// Load cart from localStorage
const loadCartFromStorage = (): CartState => {
  if (typeof window === "undefined") {
    return {
      items: [],
      deliveryMethod: "delivery",
      paymentMethod: "cash",
      deliveryAddress: "",
    };
  }
  
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    try {
      return JSON.parse(storedCart);
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }
  
  return {
    items: [],
    deliveryMethod: "delivery",
    paymentMethod: "cash",
    deliveryAddress: "",
  };
};

// Save cart to localStorage
const saveCartToStorage = (cart: CartState) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(item => item.menuItem.id === action.payload.id);
      
      if (existingItemIndex >= 0) {
        // Item already exists, increment quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, { menuItem: action.payload, quantity: 1 }],
        };
      }
    }
    
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter(item => item.menuItem.id !== action.payload),
      };
    }
    
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.menuItem.id !== id),
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.menuItem.id === id ? { ...item, quantity } : item
        ),
      };
    }
    
    case "SET_DELIVERY_METHOD": {
      return { ...state, deliveryMethod: action.payload };
    }
    
    case "SET_PAYMENT_METHOD": {
      return { ...state, paymentMethod: action.payload };
    }
    
    case "SET_DELIVERY_ADDRESS": {
      return { ...state, deliveryAddress: action.payload };
    }
    
    case "CLEAR_CART": {
      return {
        items: [],
        deliveryMethod: "delivery",
        paymentMethod: "cash",
        deliveryAddress: "",
      };
    }
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());
  
  // Calculate derived values
  const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = state.items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  const deliveryFee = state.deliveryMethod === "delivery" ? (subtotal >= 35 ? 0 : 3.99) : 0;
  const tax = subtotal * 0.0825; // 8.25% tax rate
  const total = subtotal + deliveryFee + tax;
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    saveCartToStorage(state);
  }, [state]);
  
  // Cart actions
  const addItem = (item: MenuItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };
  
  const removeItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };
  
  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };
  
  const setDeliveryMethod = (method: "delivery" | "pickup") => {
    dispatch({ type: "SET_DELIVERY_METHOD", payload: method });
  };
  
  const setPaymentMethod = (method: "cash" | "paypal") => {
    dispatch({ type: "SET_PAYMENT_METHOD", payload: method });
  };
  
  const setDeliveryAddress = (address: string) => {
    dispatch({ type: "SET_DELIVERY_ADDRESS", payload: address });
  };
  
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };
  
  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        setDeliveryMethod,
        setPaymentMethod,
        setDeliveryAddress,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
