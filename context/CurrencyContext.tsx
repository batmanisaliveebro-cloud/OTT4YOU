'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, CURRENCIES, formatPrice } from '@/lib/currency';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (amount: number) => string;
    currencies: typeof CURRENCIES;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('INR');

    // Load currency preference from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('preferred_currency');
        if (saved === 'USD' || saved === 'INR') {
            setCurrencyState(saved);
        }
    }, []);

    // Save currency preference when it changes
    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        localStorage.setItem('preferred_currency', newCurrency);
    };

    const format = (amount: number) => formatPrice(amount, currency);

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                setCurrency,
                formatPrice: format,
                currencies: CURRENCIES
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within CurrencyProvider');
    }
    return context;
}
