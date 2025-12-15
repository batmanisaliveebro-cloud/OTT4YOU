'use client';

import Image from 'next/image';
import { IProduct } from '@/models/Product';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
    product: IProduct;
    onPurchase?: (productId: string, duration: number, price: number) => void;
}

export default function ProductCard({ product, onPurchase }: ProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToCart } = useCart();
    const router = useRouter();

    const handleBuyNow = () => {
        if (product.durations[selectedDuration]) {
            // Add to cart
            addToCart({
                productId: product._id,
                productName: product.name,
                platform: product.platform,
                logo: product.logo,
                duration: product.durations[selectedDuration].months,
                price: product.durations[selectedDuration].price
            }, quantity);

            // Show success animation
            setShowSuccess(true);

            // Redirect after 1.5 seconds
            setTimeout(() => {
                setShowSuccess(false);
                setIsModalOpen(false);
                setQuantity(1);
                router.push('/checkout');
            }, 1500);
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
            }, quantity);
            setIsModalOpen(false);
            setQuantity(1);
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

                        {/* Stock Display */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                background: product.stock > 50 ? 'rgba(16, 185, 129, 0.1)' : product.stock > 10 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${product.stock > 50 ? 'var(--accent-green)' : product.stock > 10 ? 'var(--accent-orange)' : '#ef4444'}`,
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>📦</span>
                                <span style={{
                                    color: product.stock > 50 ? 'var(--accent-green)' : product.stock > 10 ? 'var(--accent-orange)' : '#ef4444',
                                    fontWeight: 600
                                }}>
                                    {product.stock} in stock
                                </span>
                            </div>
                        </div>

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

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
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

                        {/* Quantity Selector */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                                Quantity
                            </h4>
                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="input"
                                style={{
                                    maxWidth: '150px',
                                    padding: '0.75rem',
                                    fontSize: '1rem',
                                    fontWeight: 600
                                }}
                            >
                                {[1, 2, 3, 4, 5].map(num => (
                                    <option key={num} value={num}>
                                        {num} {num === 1 ? 'Unit' : 'Units'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Summary */}
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1rem',
                            background: 'rgba(139, 92, 246, 0.05)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <span>Price per unit:</span>
                                <span>₹{product.durations[selectedDuration]?.price}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <span>Quantity:</span>
                                <span>×{quantity}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '0.75rem',
                                borderTop: '1px solid var(--glass-border)',
                                fontWeight: 700,
                                fontSize: '1.25rem'
                            }}>
                                <span>Total:</span>
                                <span style={{ color: 'var(--primary-start)' }}>
                                    ₹{(product.durations[selectedDuration]?.price || 0) * quantity}
                                </span>
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
                                disabled={product.stock < 1}
                                style={{
                                    padding: '0.75rem',
                                    border: '1px solid var(--primary-start)'
                                }}
                            >
                                Add to Cart
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleBuyNow}
                                disabled={product.stock < 1}
                            >
                                Buy Now
                            </button>
                        </div>

                        {product.stock < 1 && (
                            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#ef4444', fontSize: '0.9rem' }}>
                                Out of stock
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Success Animation Dialog */}
            {showSuccess && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                        padding: '3rem',
                        borderRadius: 'var(--radius-xl)',
                        border: '2px solid var(--primary-start)',
                        boxShadow: '0 0 50px rgba(139, 92, 246, 0.5)',
                        textAlign: 'center',
                        animation: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-green), #059669)',
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'checkmarkPop 0.5s ease 0.2s both'
                        }}>
                            <span style={{ fontSize: '3rem', color: 'white' }}>✓</span>
                        </div>
                        <h2 style={{
                            fontSize: '1.75rem',
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, var(--primary-start), var(--primary-end))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Added to Cart!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            Redirecting to checkout...
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
