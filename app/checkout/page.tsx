'use client';

import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Script from 'next/script';

declare global {
    interface Window {
        Cashfree: any;
    }
}

export default function CheckoutPage() {
    const { items, totalAmount, clearCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // Wait for session and cart to load before showing content
    useEffect(() => {
        if (status !== 'loading') {
            // Give cart context time to hydrate from localStorage
            const timer = setTimeout(() => {
                setPageLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [status]);

    useEffect(() => {
        if (!pageLoading && !session) {
            router.push('/cart');
        }
    }, [session, router, pageLoading]);

    const handlePayment = async () => {
        if (!sdkLoaded) {
            alert('Payment system is loading. Please wait...');
            return;
        }

        setLoading(true);

        try {
            const orderResponse = await fetch('/api/cashfree/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    items: items,
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderData.success) {
                alert(orderData.error || 'Failed to create order');
                setLoading(false);
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
                    setLoading(false);
                    return;
                }

                if (result.redirect) {
                    console.log('Redirecting...');
                }

                if (result.paymentDetails) {
                    verifyPayment(orderData.orderId);
                }
            });

        } catch (error) {
            console.error('Payment error:', error);
            alert('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    const verifyPayment = async (orderId: string) => {
        try {
            const response = await fetch('/api/cashfree/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderId,
                    items: items,
                }),
            });

            const data = await response.json();

            if (data.success) {
                clearCart();
                setLoading(false);
                setShowSuccess(true);

                setTimeout(() => {
                    router.push('/');
                }, 5000);
            } else {
                alert(data.error || 'Payment verification failed');
                setLoading(false);
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed. Please contact support.');
            setLoading(false);
        }
    };

    // Loading state while cart and session hydrate
    if (pageLoading) {
        return (
            <>
                <Header />
                <main style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(139, 92, 246, 0.2)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '1rem',
                    }}></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading checkout...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </main>
            </>
        );
    }

    // Empty cart state (only show after page has loaded)
    if ((!session || items.length === 0) && !showSuccess) {
        return (
            <>
                <Header />
                <main style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                    <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', marginBottom: '0.5rem' }}>Cart is empty</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Add items to your cart before checkout.
                    </p>
                </main>
            </>
        );
    }

    // Success state
    if (showSuccess) {
        return (
            <>
                <Header />
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.98), rgba(26, 26, 46, 0.98))',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <div style={{ textAlign: 'center', maxWidth: '100%' }}>
                        <div style={{
                            width: 'clamp(80px, 20vw, 120px)',
                            height: 'clamp(80px, 20vw, 120px)',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
                        }}>
                            <span style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', color: 'white' }}>✓</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                            fontWeight: 800,
                            marginBottom: '0.75rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Payment Successful!
                        </h1>

                        <p style={{
                            fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                            color: 'var(--text-secondary)',
                            marginBottom: '1.5rem',
                        }}>
                            Your order has been placed.
                        </p>

                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '10px',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            fontSize: '0.85rem',
                        }}>
                            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Redirecting...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Main checkout
    return (
        <>
            <Script
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                onLoad={() => setSdkLoaded(true)}
            />

            <Header />
            <main style={{
                padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 2vw, 1rem)',
                maxWidth: '500px',
                margin: '0 auto',
                minHeight: '70vh',
            }}>
                <h1 style={{
                    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
                    marginBottom: '1rem',
                    textAlign: 'center',
                }}>Checkout</h1>

                {/* Order Summary - Compact */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    marginBottom: '1rem',
                }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                        Order Summary
                    </h3>

                    {items.map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0',
                            borderBottom: index < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.productName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {item.duration} month{item.duration > 1 ? 's' : ''}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#10b981' }}>
                                ₹{item.price}
                            </div>
                        </div>
                    ))}

                    <div style={{
                        borderTop: '1px solid rgba(139, 92, 246, 0.3)',
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                    }}>
                        <span>Total</span>
                        <span style={{ color: '#10b981' }}>₹{totalAmount}</span>
                    </div>
                </div>

                {/* Payment Method Selector */}
                <div style={{
                    background: 'rgba(26, 26, 46, 0.8)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                        Select Payment Method
                    </h3>
                    
                    {/* Cashfree Option - Radio Style */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.875rem',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))',
                        border: '2px solid #8b5cf6',
                        borderRadius: '10px',
                        cursor: 'pointer',
                    }}>
                        {/* Radio Button */}
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px solid #8b5cf6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(139, 92, 246, 0.2)',
                        }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#8b5cf6',
                            }}></div>
                        </div>
                        
                        {/* Payment Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>
                                💳 Cashfree Payments
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                                UPI • Credit/Debit Card • Net Banking • Wallets
                            </div>
                        </div>
                        
                        {/* Secure Badge */}
                        <div style={{
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(16, 185, 129, 0.15)',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            color: '#10b981',
                            fontWeight: 600,
                        }}>
                            🔒 Secure
                        </div>
                    </label>
                </div>

                {/* Pay Button */}
                <button
                    onClick={handlePayment}
                    disabled={loading || !sdkLoaded}
                    style={{
                        width: '100%',
                        padding: 'clamp(1rem, 3vw, 1.25rem)',
                        borderRadius: '12px',
                        border: 'none',
                        background: loading || !sdkLoaded
                            ? 'rgba(139, 92, 246, 0.5)'
                            : 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 'clamp(1rem, 3vw, 1.15rem)',
                        cursor: loading || !sdkLoaded ? 'not-allowed' : 'pointer',
                        boxShadow: loading || !sdkLoaded ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                    }}
                >
                    {loading ? (
                        <>Processing Payment...</>
                    ) : !sdkLoaded ? (
                        <>Loading...</>
                    ) : (
                        <>Pay ₹{totalAmount}</>
                    )}
                </button>

                <p style={{
                    textAlign: 'center',
                    marginTop: '0.75rem',
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.4,
                }}>
                    Credentials delivered to your email after payment
                </p>
            </main>

            {/* Loading Overlay */}
            {loading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    padding: '1rem',
                }}>
                    <div className="spinner" style={{
                        width: 'clamp(40px, 10vw, 60px)',
                        height: 'clamp(40px, 10vw, 60px)',
                        borderWidth: '3px',
                        marginBottom: '1rem',
                    }} />
                    <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
                        Processing Payment...
                    </h2>
                    <p style={{ color: '#888', fontSize: '0.85rem' }}>Please wait</p>
                </div>
            )}
        </>
    );
}
