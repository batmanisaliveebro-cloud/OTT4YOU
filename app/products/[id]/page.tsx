'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IProduct } from '@/models/Product';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { convertPrice } from '@/lib/currency';
import { useSession, signIn } from 'next-auth/react';
import Script from 'next/script';

interface PageProps {
    params: { id: string };
}

declare global {
    interface Window {
        Cashfree: any;
    }
}

export default function ProductDetailsPage({ params }: PageProps) {
    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cashfree' | 'crypto'>('cashfree');
    const { addToCart } = useCart();
    const { currency, formatPrice } = useCurrency();
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

    const handleBuyNow = async () => {
        if (!session) {
            signIn('google', { callbackUrl: `/products/${params.id}` });
            return;
        }

        if (product && product.durations[selectedDuration]) {
            setPaymentLoading(true);
            try {
                // Direct Buy - Open Payment Gateway directly
                const selectedPlan = product.durations[selectedDuration];
                const totalPrice = selectedPlan.price * quantity;

                // Create Order Session
                const orderResponse = await fetch('/api/cashfree/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: totalPrice,
                        items: [{
                            productId: product._id,
                            productName: product.name,
                            platform: product.platform,
                            logo: product.logo,
                            duration: selectedPlan.months,
                            price: selectedPlan.price,
                            quantity: quantity
                        }],
                    }),
                });

                const orderData = await orderResponse.json();

                if (!orderData.success) {
                    alert(orderData.error || 'Failed to create order');
                    setPaymentLoading(false);
                    return;
                }

                if (!window.Cashfree) {
                    alert('Payment SDK not loaded. Please refresh.');
                    setPaymentLoading(false);
                    return;
                }

                const cashfree = window.Cashfree({
                    mode: 'production',
                });

                const checkoutOptions = {
                    paymentSessionId: orderData.paymentSessionId,
                    redirectTarget: '_modal',
                };

                cashfree.checkout(checkoutOptions).then((result: any) => {
                    if (result.error) {
                        console.error('Payment error:', result.error);
                        alert('Payment failed. Please try again.');
                    }
                    if (result.paymentDetails) {
                        // Redirect to dashboard or common success page
                        // Verify API will handle status update via webhook or we can call verify here
                        // For direct buy, better to redirect to dashboard to see status
                        router.push(`/dashboard?order_id=${orderData.orderId}`);
                    }
                    setPaymentLoading(false);
                });

            } catch (error) {
                console.error('Direct buy error:', error);
                alert('An error occurred. Please try again.');
                setPaymentLoading(false);
            }
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
            }, 1200);
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

    const selectedPlan = product.durations[selectedDuration];
    const totalPrice = (selectedPlan?.price || 0) * quantity;

    return (
        <>
            <Header />
            <Script
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                strategy="lazyOnload"
            />
            <main style={{ padding: '2rem 0 4rem', minHeight: '80vh' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/products')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            cursor: 'pointer',
                            marginBottom: '2rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                        }}
                    >
                        ← Back to Products
                    </button>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '400px 1fr',
                        gap: '2.5rem',
                        alignItems: 'start'
                    }} className="product-details-grid">

                        {/* Left: Product Card */}
                        <div style={{
                            background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.95), rgba(15, 15, 30, 0.98))',
                            borderRadius: '24px',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            overflow: 'hidden',
                            position: 'sticky',
                            top: '100px',
                        }}>
                            {/* Logo Section */}
                            {/* Logo Section */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
                                padding: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
                            }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    position: 'relative',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                                    marginBottom: '1.5rem',
                                }}>
                                    <Image
                                        src={product.logo}
                                        alt={product.platform}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>

                                <span style={{
                                    padding: '6px 16px',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    color: '#a78bfa',
                                    fontWeight: 600,
                                    marginBottom: '0.75rem',
                                }}>
                                    {product.platform}
                                </span>

                                <h1 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    marginBottom: '0.5rem',
                                }}>
                                    {product.name}
                                </h1>
                            </div>

                            {/* Availability Status */}
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    background: (product as any).unavailable ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '12px',
                                    border: `1px solid ${(product as any).unavailable ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                }}>
                                    <span style={{ fontSize: '1.1rem' }}>{(product as any).unavailable ? '❌' : '✅'}</span>
                                    <span style={{
                                        color: (product as any).unavailable ? '#ef4444' : '#10b981',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                    }}>
                                        {(product as any).unavailable ? 'Currently Unavailable' : 'Available Now'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Details & Purchase */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Description Card */}
                            <div style={{
                                background: 'rgba(26, 26, 46, 0.6)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '1.5rem',
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                                    About
                                </h3>
                                <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                    {product.description}
                                </p>
                            </div>

                            {/* Features Card */}
                            <div style={{
                                background: 'rgba(26, 26, 46, 0.6)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '1.5rem',
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                                    What's Included
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                    {product.features.map((feature, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            background: 'rgba(139, 92, 246, 0.05)',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(139, 92, 246, 0.1)',
                                        }}>
                                            <span style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                color: '#fff',
                                                flexShrink: 0,
                                            }}>✓</span>
                                            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing Plans Card */}
                            <div style={{
                                background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(26, 26, 46, 0.8))',
                                borderRadius: '16px',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                padding: '1.5rem',
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                                    Choose Your Plan
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                    {product.durations.map((duration: any, index: number) => {
                                        const isAvailable = duration.available !== false;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => isAvailable && setSelectedDuration(index)}
                                                disabled={!isAvailable}
                                                style={{
                                                    padding: '1rem 0.5rem',
                                                    borderRadius: '12px',
                                                    border: !isAvailable
                                                        ? '2px solid rgba(239, 68, 68, 0.3)'
                                                        : selectedDuration === index
                                                            ? '2px solid #8b5cf6'
                                                            : '2px solid rgba(255, 255, 255, 0.1)',
                                                    background: !isAvailable
                                                        ? 'rgba(239, 68, 68, 0.05)'
                                                        : selectedDuration === index
                                                            ? 'rgba(139, 92, 246, 0.2)'
                                                            : 'rgba(255, 255, 255, 0.03)',
                                                    color: !isAvailable ? '#ef4444' : '#fff',
                                                    cursor: !isAvailable ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    transition: 'all 0.2s ease',
                                                    opacity: !isAvailable ? 0.6 : 1,
                                                    textDecoration: !isAvailable ? 'line-through' : 'none',
                                                }}
                                            >
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: !isAvailable ? '#ef4444' : selectedDuration === index ? '#a78bfa' : 'rgba(255, 255, 255, 0.5)',
                                                    fontWeight: 500,
                                                }}>
                                                    {duration.months} {duration.months === 1 ? 'Month' : 'Months'}
                                                </span>
                                                <span style={{
                                                    fontSize: '1.25rem',
                                                    fontWeight: 700,
                                                    color: !isAvailable ? '#ef4444' : selectedDuration === index ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                                                }}>
                                                    ₹{duration.price}
                                                </span>
                                                {!isAvailable ? (
                                                    <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 600 }}>Unavailable</span>
                                                ) : duration.months >= 6 && (
                                                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600 }}>
                                                        Save {Math.round((1 - (duration.price / (product.durations[0].price * duration.months))) * 100)}%
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quantity & Total Card */}
                            <div style={{
                                background: 'rgba(26, 26, 46, 0.6)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '1.5rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Quantity</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '1.25rem',
                                            }}
                                        >−</button>
                                        <span style={{
                                            minWidth: '40px',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                        }}>{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(5, quantity + 1))}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '1.25rem',
                                            }}
                                        >+</button>
                                    </div>
                                </div>

                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(139, 92, 246, 0.08)',
                                    borderRadius: '12px',
                                    marginBottom: '1.25rem',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                                            {selectedPlan?.months} {selectedPlan?.months === 1 ? 'Month' : 'Months'} × {quantity}
                                        </span>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                                            ₹{selectedPlan?.price} × {quantity}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                    }}>
                                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total</span>
                                        <span style={{
                                            fontWeight: 700,
                                            fontSize: '1.5rem',
                                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}>
                                            ₹{totalPrice}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {(() => {
                                    const isProductUnavailable = (product as any).unavailable;
                                    const selectedPlanAvailable = product.durations[selectedDuration]?.available !== false;
                                    const canPurchase = !isProductUnavailable && selectedPlanAvailable;
                                    return (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                <button
                                                    onClick={handleAddToCart}
                                                    disabled={!canPurchase}
                                                    style={{
                                                        padding: '0.875rem',
                                                        borderRadius: '12px',
                                                        border: '2px solid #8b5cf6',
                                                        background: 'transparent',
                                                        color: '#a78bfa',
                                                        fontWeight: 600,
                                                        fontSize: '0.95rem',
                                                        cursor: !canPurchase ? 'not-allowed' : 'pointer',
                                                        opacity: !canPurchase ? 0.5 : 1,
                                                    }}
                                                >
                                                    Add to Cart
                                                </button>
                                                <button
                                                    onClick={handleBuyNow}
                                                    disabled={!canPurchase || paymentLoading}
                                                    style={{
                                                        padding: '0.875rem',
                                                        borderRadius: '12px',
                                                        border: 'none',
                                                        background: paymentLoading
                                                            ? 'rgba(139, 92, 246, 0.5)'
                                                            : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        fontSize: '0.95rem',
                                                        cursor: (!canPurchase || paymentLoading) ? 'not-allowed' : 'pointer',
                                                        opacity: (!canPurchase || paymentLoading) ? 0.5 : 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    {paymentLoading ? (
                                                        <>
                                                            <span className="spinner-small" style={{
                                                                width: '16px',
                                                                height: '16px',
                                                                border: '2px solid rgba(255,255,255,0.3)',
                                                                borderTopColor: '#fff',
                                                                borderRadius: '50%',
                                                                animation: 'spin 1s linear infinite'
                                                            }}></span>
                                                            Wait...
                                                        </>
                                                    ) : 'Buy Now'}
                                                </button>
                                            </div>

                                            {!canPurchase && (
                                                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#ef4444', fontSize: '0.875rem' }}>
                                                    {isProductUnavailable ? 'This product is currently unavailable' : 'Selected plan is unavailable'}
                                                </p>
                                            )}
                                        </>
                                    );
                                })()}
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
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.98), rgba(15, 15, 30, 0.98))',
                        padding: '2.5rem',
                        borderRadius: '24px',
                        border: '2px solid rgba(16, 185, 129, 0.4)',
                        boxShadow: '0 0 60px rgba(16, 185, 129, 0.3)',
                        textAlign: 'center',
                        minWidth: '280px',
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            margin: '0 auto 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <span style={{ fontSize: '2rem', color: 'white' }}>✓</span>
                        </div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>
                            Added to Cart!
                        </h2>
                    </div>
                </div>
            )}

            <Footer />

            <style jsx>{`
                @media (max-width: 900px) {
                    .product-details-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                }
                @media (max-width: 600px) {
                    .product-details-grid > div:last-child > div:nth-child(3) > div {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner-small {
                    display: inline-block;
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </>
    );
}
