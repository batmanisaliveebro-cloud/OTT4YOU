'use client';

import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const { items, totalAmount, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'MANUAL_UPI'>('RAZORPAY');
    const [manualDetails, setManualDetails] = useState({ utr: '', screenshot: '' });
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        if (!session) {
            router.push('/cart');
        }
    }, [session, router]);

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB Limit
                setFileError('File size too large (Max 2MB)');
                return;
            }
            setFileError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setManualDetails(prev => ({ ...prev, screenshot: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePayment = async () => {
        setLoading(true);

        try {
            if (paymentMethod === 'MANUAL_UPI') {
                if (!manualDetails.utr || !manualDetails.screenshot) {
                    alert('Please enter UTR and upload a screenshot');
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/orders/manual', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items,
                        amount: totalAmount,
                        utr: manualDetails.utr,
                        screenshot: manualDetails.screenshot
                    }),
                });

                const data = await response.json();
                if (data.success) {
                    clearCart();
                    router.push('/dashboard?payment=manual_pending'); // Redirect to dashboard with message
                } else {
                    alert(data.error || 'Failed to submit order');
                }

            } else {
                // RAZORPAY FLOW
                alert(`Online Payment is temporarily under maintenance. Please select "Pay via QR Code" to pay ₹${totalAmount} instantly.`);
                setLoading(false);
                return;

                /* RAZORPAY CODE COMMENTED OUT FOR MAINTENANCE
                const response = await fetch('/api/payment/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: totalAmount,
                        productId: 'CART_CHECKOUT',
                        productName: `Cart Checkout (${items.length} items)`,
                        duration: 0,
                        isCart: true,
                        items: items
                    }),
                });
                */

                const data = await response.json();

                if (!data.success) {
                    alert('Failed to initiate payment');
                    setLoading(false);
                    return;
                }

                const options = {
                    key: data.keyId,
                    amount: data.amount,
                    currency: data.currency,
                    name: 'OTT4YOU',
                    description: 'Subscription Purchase',
                    order_id: data.orderId,
                    handler: async function (response: any) {
                        const verifyResponse = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                productId: 'CART_CHECKOUT',
                                isCart: true,
                                items: items,
                                amount: totalAmount
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            clearCart();
                            router.push('/dashboard');
                        } else {
                            alert('Payment verification failed');
                        }
                    },
                    prefill: {
                        name: session?.user?.name,
                        email: session?.user?.email,
                    },
                    theme: {
                        color: '#8b5cf6',
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }

        } catch (error) {
            console.error('Payment error:', error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!session || items.length === 0) return null;

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
                <h1 className="section-title">Checkout</h1>

                <div className="glass-card">
                    <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        Order Review
                    </h3>

                    <div style={{ marginBottom: '2rem' }}>
                        {items.map((item) => (
                            <div key={item.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem',
                                color: 'var(--text-secondary)'
                            }}>
                                <span>{item.platform} ({item.duration}M) x {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <div style={{
                            borderTop: '1px solid var(--glass-border)',
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: 'bold',
                            fontSize: '1.25rem'
                        }}>
                            <span>Total Amount</span>
                            <span>₹{totalAmount}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h4>Select Payment Method</h4>

                        {/* Razorpay Option */}
                        <div
                            onClick={() => setPaymentMethod('RAZORPAY')}
                            style={{
                                padding: '1rem',
                                background: paymentMethod === 'RAZORPAY' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary)',
                                border: paymentMethod === 'RAZORPAY' ? '1px solid var(--primary-start)' : '1px solid transparent',
                                borderRadius: 'var(--radius-md)',
                                marginTop: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '2px solid' + (paymentMethod === 'RAZORPAY' ? ' var(--primary-start)' : ' #666'),
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {paymentMethod === 'RAZORPAY' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-start)' }} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 500 }}>Pay Online (Instant)</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Cards, UPI, NetBanking (Secured by Razorpay)
                                </div>
                            </div>
                        </div>

                        {/* Manual QR Option */}
                        <div
                            onClick={() => setPaymentMethod('MANUAL_UPI')}
                            style={{
                                padding: '1rem',
                                background: paymentMethod === 'MANUAL_UPI' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary)',
                                border: paymentMethod === 'MANUAL_UPI' ? '1px solid var(--primary-start)' : '1px solid transparent',
                                borderRadius: 'var(--radius-md)',
                                marginTop: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '2px solid' + (paymentMethod === 'MANUAL_UPI' ? ' var(--primary-start)' : ' #666'),
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {paymentMethod === 'MANUAL_UPI' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-start)' }} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 500 }}>Pay via QR Code (Manual Verification)</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Scan QR, Pay via any UPI App, and submit details.
                                </div>
                            </div>
                        </div>

                        {/* Manual Payment Form */}
                        {paymentMethod === 'MANUAL_UPI' && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1.5rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)',
                                animation: 'fadeIn 0.3s'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <p style={{ marginBottom: '1rem', color: '#ffeb3b', fontSize: '0.9rem' }}>
                                        Scan this QR to pay <strong>₹{totalAmount}</strong>
                                    </p>
                                    <img
                                        src="/payment-qr.jpg"
                                        alt="Payment QR"
                                        style={{
                                            width: '200px',
                                            height: '200px',
                                            borderRadius: '8px',
                                            border: '2px solid white'
                                        }}
                                    />
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#aaa' }}>
                                        Accepts PhonePe, GPay, Paytm, etc.
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label>Enter UTR / Transaction ID <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. 123456789012"
                                        value={manualDetails.utr}
                                        onChange={(e) => setManualDetails({ ...manualDetails, utr: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Upload Payment Screenshot <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="input"
                                        onChange={handleScreenshotChange}
                                        style={{ padding: '0.5rem' }}
                                    />
                                    {fileError && <p style={{ color: 'red', fontSize: '0.8rem' }}>{fileError}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="btn btn-primary full-width btn-lg btn-glow"
                    >
                        {loading
                            ? 'Processing...'
                            : paymentMethod === 'RAZORPAY'
                                ? `Pay ₹${totalAmount} Now`
                                : `Submit Payment Details`
                        }
                    </button>

                    {paymentMethod === 'MANUAL_UPI' && (
                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#aaa' }}>
                            Your order will be verified within 15-30 mins manually.
                        </p>
                    )}
                </div>
            </main>
            <Footer />

            {/* Payment Processing Overlay */}
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
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderTopColor: 'var(--primary-start)'
                    }} />
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(to right, #fff, #bbb)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Processing...
                    </h2>
                    <p style={{ color: '#aaa' }}>Please do not close this window</p>
                </div>
            )}
        </>
    );
}
