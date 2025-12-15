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
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [sdkLoaded, setSdkLoaded] = useState(false);

    useEffect(() => {
        if (!session) {
            router.push('/cart');
        }
    }, [session, router]);

    const handlePayment = async () => {
        if (!sdkLoaded) {
            alert('Payment system is loading. Please wait...');
            return;
        }

        setLoading(true);

        try {
            // Step 1: Create order in backend
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

            // Step 2: Initialize Cashfree checkout
            const cashfree = window.Cashfree({
                mode: 'production', // or 'sandbox' for testing
            });

            const checkoutOptions = {
                paymentSessionId: orderData.paymentSessionId,
                redirectTarget: '_modal', // Opens popup
            };

            // Step 3: Open payment popup
            cashfree.checkout(checkoutOptions).then((result: any) => {
                if (result.error) {
                    console.error('Payment error:', result.error);
                    alert('Payment failed. Please try again.');
                    setLoading(false);
                    return;
                }

                if (result.redirect) {
                    // Payment is being processed
                    console.log('Redirecting...');
                }

                if (result.paymentDetails) {
                    // Payment successful - verify on backend
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

                // Redirect to home after 5 seconds
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

    if ((!session || items.length === 0) && !showSuccess) {
        return (
            <>
                <Header />
                <main className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <h1>Cart is empty</h1>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        Add items to your cart before checkout.
                    </p>
                </main>
            </>
        );
    }

    // Show success overlay
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
                    animation: 'fadeIn 0.4s ease'
                }}>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        {/* Checkmark Circle */}
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            margin: '0 auto 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 60px rgba(16, 185, 129, 0.6)',
                        }}>
                            <span style={{ fontSize: '4rem', color: 'white' }}>✓</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Payment Successful!
                        </h1>

                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '2rem',
                        }}>
                            Your order has been placed successfully.
                        </p>

                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                        }}>
                            <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Redirecting to home...
                            </span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Cashfree SDK */}
            <Script
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                onLoad={() => setSdkLoaded(true)}
            />

            <Header />
            <main className="container" style={{ padding: '2rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
                <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>Checkout</h1>

                {/* Order Summary */}
                <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Order Summary</h3>

                    {items.map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.75rem 0',
                            borderBottom: index < items.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        }}>
                            <div>
                                <div style={{ fontWeight: 500 }}>{item.productName}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {item.duration} month{item.duration > 1 ? 's' : ''}
                                </div>
                            </div>
                            <div style={{ fontWeight: 600, color: '#10b981' }}>₹{item.price}</div>
                        </div>
                    ))}

                    <div style={{
                        borderTop: '2px solid rgba(139, 92, 246, 0.3)',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        fontSize: '1.25rem'
                    }}>
                        <span>Total</span>
                        <span style={{ color: '#10b981' }}>₹{totalAmount}</span>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="glass-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>🔒</span>
                    </div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Secure Payment by Cashfree</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Pay securely using UPI, Cards, Net Banking, or Wallets
                    </p>
                </div>

                {/* Pay Button */}
                <button
                    onClick={handlePayment}
                    disabled={loading || !sdkLoaded}
                    className="btn btn-primary full-width btn-lg btn-glow"
                    style={{
                        padding: '1.25rem',
                        fontSize: '1.1rem',
                        opacity: loading || !sdkLoaded ? 0.7 : 1,
                    }}
                >
                    {loading ? 'Processing...' : !sdkLoaded ? 'Loading...' : `Pay ₹${totalAmount}`}
                </button>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#aaa' }}>
                    Your credentials will be delivered to your registered email after payment.
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
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <div className="spinner" style={{
                        width: '60px',
                        height: '60px',
                        borderWidth: '4px',
                        marginBottom: '1.5rem',
                    }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Processing Payment...
                    </h2>
                    <p style={{ color: '#aaa' }}>Please do not close this window</p>
                </div>
            )}
        </>
    );
}
