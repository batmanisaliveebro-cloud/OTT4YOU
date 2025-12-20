'use client';

import { useCurrency } from '@/context/CurrencyContext';
import type { CurrencyConfig } from '@/lib/currency';

export default function CurrencySelector() {
    const { currency, setCurrency, currencies } = useCurrency();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
            <span style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 500,
            }}>
                Currency:
            </span>
            <div style={{
                display: 'flex',
                gap: '0.25rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                padding: '2px',
            }}>
                {Object.values(currencies).map((curr: CurrencyConfig) => (
                    <button
                        key={curr.code}
                        onClick={() => setCurrency(curr.code)}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '4px',
                            border: 'none',
                            background: currency === curr.code
                                ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                                : 'transparent',
                            color: currency === curr.code
                                ? '#fff'
                                : 'rgba(255, 255, 255, 0.6)',
                            fontWeight: currency === curr.code ? 600 : 500,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {curr.code}
                    </button>
                ))}
            </div>
        </div>
    );
}
