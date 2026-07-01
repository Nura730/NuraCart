import { createContext, type ReactNode } from "react";
import type { CartItem, Product } from "../types";


interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, qunatity?: number)=> void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (ProductId: string, qunatity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({children} : {children: ReactNode}) {
    return <CartContext.Provider value={{}}>
        {children}
    </CartContext.Provider>
}

export function useCart() {
    const conect = useContex(CartContext)
    if(!)
}