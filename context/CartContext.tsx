'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: string; // unique cart item id (productId + duration)
    productId: string;
    productName: string;
    platform: string;
    logo: string;
    duration: number;
    price: number;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    itemCount: number;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('ott4you_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // Ensure all items have valid IDs to prevent duplicates
                const validated = parsed.map((item: CartItem) => ({
                    ...item,
                    id: item.id || `${item.productId}-${item.duration}`
                }));
                setItems(validated);
            } catch (e) {
                console.error('Failed to parse cart', e);
                localStorage.removeItem('ott4you_cart');
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('ott4you_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: Omit<CartItem, 'id' | 'quantity'>, quantity: number = 1) => {
        setItems(prev => {
            const id = `${newItem.productId}-${newItem.duration}`;
            const existingIndex = prev.findIndex(item => item.id === id);

            if (existingIndex > -1) {
                // Return new array with updated quantity
                const newItems = [...prev];
                const item = newItems[existingIndex];
                newItems[existingIndex] = {
                    ...item,
                    quantity: Math.min(item.quantity + quantity, 5)
                };
                return newItems;
            }

            // Add new item with specified quantity (max 5)
            // Check if item with same productId and duration already exists even if ID is broken
            const duplicateCheck = prev.findIndex(item =>
                item.productId === newItem.productId && item.duration === newItem.duration
            );

            if (duplicateCheck > -1) {
                const newItems = [...prev];
                const item = newItems[duplicateCheck];
                // Fix ID if missing
                newItems[duplicateCheck] = {
                    ...item,
                    id: id,
                    quantity: Math.min(item.quantity + quantity, 5)
                };
                return newItems;
            }

            return [...prev, { ...newItem, id, quantity: Math.min(quantity, 5) }];
        });
        alert(`Added ${quantity} item(s) to cart!`);
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1 || quantity > 5) return;

        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ));
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            itemCount,
            totalAmount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
