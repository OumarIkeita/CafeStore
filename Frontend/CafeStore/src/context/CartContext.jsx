import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cafestore_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("cafestore_cart", JSON.stringify(items));
  }, [items]);

  // Add a product or increase its quantity
  const addToCart = (product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  // Change quantity or remove the item when quantity is zero
  const updateQuantity = (id, quantity) => {
    const newQuantity = Number(quantity);

    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // Remove one product
  const removeFromCart = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  // Empty the entire cart
  const clearCart = () => setItems([]);

  // Number of individual units in the cart
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  // Cart total for display
  const total = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      count,
      total,
    }),
    [items, count, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
