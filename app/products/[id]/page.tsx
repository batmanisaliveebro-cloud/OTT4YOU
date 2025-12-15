'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IProduct } from '@/models/Product';
import { useCart } from '@/context/CartContext';
import { useSession, signIn } from 'next-auth/react';

interface PageProps {
    params: { id: string };
}

export default function ProductDetailsPage({ params }: PageProps) {
    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDuration, setSelectedDuration] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToCart } = useCart();
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.id}`);
            const data = await response.json();
            if (data.success) {
                setProduct(data.product);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = () => {
        if (!session) {
            signIn('google', { callbackUrl: `/products/${params.id}` });
            return;
        }

        if (product && product.durations[selectedDuration]) {
            addToCart({
                productId: product._id,
                productName: product.name,
                platform: product.platform,
                logo: product.logo,
                duration: product.durations[selectedDuration].months,
                price: product.durations[selectedDuration].price
            }, quantity);

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.push('/checkout');
            }, 1500);
        }
    };

    const handleAddToCart = () => {
        if (!session) {
            signIn('google', { callbackUrl: `/products/${params.id}` });
            return;
        }

        if (product && product.durations[selectedDuration]) {
            addToCart({
                productId: product._id,
                productName: product.name,
                platform: product.platform,
                logo: product.logo,
                duration: product.durations[selectedDuration].months,
                price: product.durations[selectedDuration].price
            }, quantity);

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
            }, 1500);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" />
                </main>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header />
                <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Product Not Found</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            The product you're looking for doesn't exist.
                        </p>
                        <button className="btn btn-primary" onClick={() => router.push('/products')}>
                            Back to Products
                        </button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main style={{ padding: '2rem 0 4rem' }}>
                <div className="container">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/products')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            marginBottom: '2rem',
                            fontSize: '1rem'
                        }}
                    >
                        ← Back to Products
                    </button>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '3rem',
                        alignItems: 'start'
                    }} className="product-details-grid">
                        {/* Left: Product Image & Basic Info */}
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{
                                width: '150px',
                                height: '150px',
                                position: 'relative',
                                margin: '0 auto 1.5rem',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                background: 'var(--bg-tertiary)',
                                padding: '1rem'
                            }}>
                                <Image
                                    src={product.logo}
                                    alt={product.platform}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>

                            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                                {product.name}
                            </h1>

                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '1.1rem',
                                marginBottom: '1.5rem'
                            }}>
                                {product.platform} Premium
                            </p>

                            {/* Stock Status */}
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

                        {/* Right: Details & Purchase */}
                        <div>
                            {/* Description */}
                            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Description</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    {product.description}
                                </p>
                            </div>

                            {/* Features */}
                            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Key Features</h3>
                                <ul style={{ listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
                                    {product.features.map((feature, index) => (
                                        <li key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <span style={{ color: 'var(--accent-green)' }}>✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pricing Plans */}
                            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Select Plan</h3>
                                <div className="duration-grid">
                                    {product.durations.map((duration, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedDuration(index)}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: `2px solid ${selectedDuration === index ? 'var(--primary-start)' : 'var(--glass-border)'}`,
                                                background: selectedDuration === index ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary)',
                                                color: 'var(--text-primary)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                            }}
                                        >
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                {duration.months} {duration.months === 1 ? 'Month' : 'Months'}
                                            </span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                                ₹{duration.price}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity & Purchase */}
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Quantity</h4>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="input"
                                        style={{ maxWidth: '150px', padding: '0.75rem', fontSize: '1rem', fontWeight: 600 }}
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
                                    marginBottom: '1.5rem',
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

                                {/* Action Buttons */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleAddToCart}
                                        disabled={product.stock < 1}
                                        style={{ padding: '0.75rem', border: '1px solid var(--primary-start)' }}
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
                    </div>
                </div>
            </main>

            {/* Success Notification */}
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
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                        padding: '3rem',
                        borderRadius: 'var(--radius-xl)',
                        border: '2px solid var(--primary-start)',
                        boxShadow: '0 0 50px rgba(139, 92, 246, 0.5)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-green), #059669)',
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
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
                            Product added successfully
                        </p>
                    </div>
                </div>
            )}

            <Footer />

            <style jsx>{`
                @media (max-width: 768px) {
                    .product-details-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                }
            `}</style>
        </>
    );
}
