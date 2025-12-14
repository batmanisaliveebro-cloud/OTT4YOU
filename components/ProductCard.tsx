'use client';

import Image from 'next/image';
import { IProduct } from '@/models/Product';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
    product: IProduct;
    onPurchase?: (productId: string, duration: number, price: number) => void;
}

export default function ProductCard({ product, onPurchase }: ProductCardProps) {
    const [selectedDuration, setSelectedDuration] = useState(0);
    const { addToCart } = useCart();

    const handlePurchase = () => {
        if (onPurchase && product.durations[selectedDuration]) {
            onPurchase(
                product._id,
                product.durations[selectedDuration].months,
                product.durations[selectedDuration].price
            );
        }
    };

    const handleAddToCart = () => {
        if (product.durations[selectedDuration]) {
            addToCart({
                productId: product._id,
                productName: product.name,
                platform: product.platform,
                logo: product.logo,
                duration: product.durations[selectedDuration].months,
                price: product.durations[selectedDuration].price
            });
        }
    };

    return (
        <div className="glass-card" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-tertiary)',
                    padding: '0.5rem',
                }}>
                    <Image
                        src={product.logo}
                        alt={product.platform}
                        fill
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                        {product.platform}
                    </h3>
                    <span className="badge badge-success">Active</span>
                </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                {product.description}
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    Features
                </h4>
                <ul style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                }}>
                    {product.features.map((feature, index) => (
                        <li key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                        }}>
                            <span style={{ color: 'var(--accent-green)' }}>✓</span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    Choose Duration
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                }}>
                    {product.durations.map((duration, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDuration(index)}
                            style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: `2px solid ${selectedDuration === index
                                    ? 'var(--primary-start)'
                                    : 'var(--glass-border)'
                                    }`,
                                background: selectedDuration === index
                                    ? 'rgba(139, 92, 246, 0.1)'
                                    : 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.25rem',
                            }}
                        >
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {duration.months} {duration.months === 1 ? 'Month' : 'Months'}
                            </span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                                ₹{duration.price}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: 'auto'
            }}>
                <button
                    className="btn btn-secondary"
                    onClick={handleAddToCart}
                    style={{
                        padding: '0.75rem',
                        border: '1px solid var(--primary-start)'
                    }}
                >
                    Add to Cart
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handlePurchase}
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
}
