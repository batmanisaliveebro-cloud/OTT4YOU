'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CurrencyProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </CurrencyProvider>
        </SessionProvider>
    );
}
