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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(0);
    const { addToCart } = useCart();

    const handlePurchase = () => {
        if (onPurchase && product.durations[selectedDuration]) {
            onPurchase(
                product._id,
                product.durations[selectedDuration].months,
                product.durations[selectedDuration].price
            );
            setIsModalOpen(false);
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
            setIsModalOpen(false);
        }
    };

    return (
        <>
            {/* Minimalist Card */}
            <div className="glass-card" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2rem',
                position: 'relative',
                transition: 'transform 0.2s',
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-tertiary)',
                    padding: '0.5rem',
                    marginBottom: '1rem',
                }}>
                    <Image
                        src={product.logo}
                        alt={product.platform}
                        fill
                        style={{ objectFit: 'contain' }}
                    />
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    {product.name}
                </h3>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Starting at ₹{product.durations[0]?.price}
                </p>

                <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                    style={{ width: '100%' }}
                >
                    View Details
                </button>
            </div>

            {/* Details Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                }} onClick={() => setIsModalOpen(false)}>

                    <div className="glass-card" style={{
                        maxWidth: '500px',
                        width: '100%',
                        padding: '2rem',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                position: 'relative',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                background: 'var(--bg-tertiary)',
                                padding: '0.25rem',
                            }}>
                                <Image
                                    src={product.logo}
                                    alt={product.platform}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <h2 style={{ fontSize: '1.5rem' }}>{product.platform} Premium</h2>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            {product.description}
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                                Key Features
                            </h4>
                            <ul style={{
                                listStyle: 'none',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem',
                            }}>
                                {product.features.map((feature, index) => (
                                    <li key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                    }}>
                                        <span style={{ color: 'var(--accent-green)' }}>✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                                Select Plan
                            </h4>
                            Select Plan
                        </h4>
                        <div className="duration-grid">
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
                </div >
            )
}
        </>
    );
}
