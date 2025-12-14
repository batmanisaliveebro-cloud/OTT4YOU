'use client';

import { useCart } from '@/context/CartContext';

export default function CartCount() {
    const { itemCount } = useCart();

    if (itemCount === 0) return null;

    return (
        <span style={{
            background: 'var(--primary-start)',
            color: 'white',
            fontSize: '0.75rem',
            padding: '0.1rem 0.4rem',
            borderRadius: '999px',
            marginLeft: '0.25rem',
            fontWeight: 'bold'
        }}>
            {itemCount}
        </span>
    );
}
