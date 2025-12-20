// Currency conversion utilities and formatting

export type Currency = 'INR' | 'USD';

export interface CurrencyConfig {
    code: Currency;
    symbol: string;
    name: string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
    INR: {
        code: 'INR',
        symbol: '₹',
        name: 'Indian Rupee'
    },
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar'
    }
};

// Default exchange rate (can be overridden by API or admin settings)
const DEFAULT_USD_TO_INR = 83;

/**
 * Get current exchange rate (USD to INR)
 * In production, this could fetch from an API or admin settings
 */
export async function getExchangeRate(): Promise<number> {
    // TODO: Integrate with ExchangeRate-API or admin settings
    // For now, using a fixed rate
    return DEFAULT_USD_TO_INR;
}

/**
 * Convert price between currencies
 */
export async function convertPrice(
    amount: number,
    from: Currency,
    to: Currency
): Promise<number> {
    if (from === to) return amount;

    const rate = await getExchangeRate();

    if (from === 'USD' && to === 'INR') {
        return Math.round(amount * rate);
    } else if (from === 'INR' && to === 'USD') {
        return Math.round((amount / rate) * 100) / 100; // Round to 2 decimals
    }

    return amount;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: Currency): string {
    const config = CURRENCIES[currency];

    if (currency === 'USD') {
        return `${config.symbol}${amount.toFixed(2)}`;
    } else {
        return `${config.symbol}${amount.toLocaleString('en-IN')}`;
    }
}

/**
 * Calculate USD price from INR (for dual pricing)
 */
export async function calculateUSDPrice(inrPrice: number): Promise<number> {
    return await convertPrice(inrPrice, 'INR', 'USD');
}
