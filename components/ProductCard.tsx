'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { IProduct } from '@/models/Product';

interface ProductCardProps {
    product: IProduct;
    onPurchase?: (productId: string, duration: number, price: number) => void;
}

export default function ProductCard({ product, onPurchase }: ProductCardProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCardClick = () => {
        router.push(`/products/${product._id}`);
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation
        if (product.stock < 1) return;

        const firstDuration = product.durations[0];
        if (!firstDuration) return;

        addToCart({
            productId: product._id,
            productName: product.name,
            platform: product.platform,
            logo: product.logo,
            duration: firstDuration.months,
            price: firstDuration.price,
        }, 1);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const stockStatus = product.stock > 50 ? 'high' : product.stock > 10 ? 'medium' : 'low';
    const stockColor = stockStatus === 'high' ? '#10b981' : stockStatus === 'medium' ? '#f59e0b' : '#ef4444';

    return (
        <>
            <div
                className="glass-card"
                onClick={handleCardClick}
                style={{
                    cursor: 'pointer',
                    padding: '1.5rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Product Image */}
                <div style={{
                    marginBottom: '1rem',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <img
                        src={product.logo}
                        alt={product.platform}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            padding: '1rem'
                        }}
                    />
                </div>

                {/* Product Info */}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {product.name}
                </h3>
                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    flex: 1
                }}>
                    {product.description}
                </p>

                {/* Stock Badge */}
                <div style={{
                    display: 'inline-block',
                    padding: '0.4rem 0.8rem',
                    background: `${stockColor}15`,
                    color: stockColor,
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    width: 'fit-content'
                }}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>

                {/* Price */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--primary-start)' }}>
                        ₹{product.durations[0]?.price || 0}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        / {product.durations[0]?.months || 0}M
                    </span>
                </div>

                {/* Quick Add Button */}
                <button
                    onClick={handleQuickAdd}
                    disabled={product.stock < 1}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                >
                    Quick Add to Cart
                </button>
            </div>

            {/* Success Toast */}
            {showSuccess && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: '#10b981',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 10000
                }}>
                    ✓ Added to cart!
                </div>
            )}
        </>
    );
}
