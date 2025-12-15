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

// TODO: REPLACE THIS WITH YOUR UPI ID
const UPI_VPA = 'BATMANISALIVEEBRO@OKSBI';
const UPI_NAME = 'OTT4YOU';

export default function CheckoutPage() {
    const { items, totalAmount, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'MANUAL_UPI'>('RAZORPAY');
    const [manualDetails, setManualDetails] = useState({ utr: '', screenshot: '' });
    const [fileError, setFileError] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (!session) {
            router.push('/cart');
        }
    }, [session, router]);

    // Generate Dynamic QR Code
    useEffect(() => {
        if (totalAmount > 0) {
            const generateQR = async () => {
                try {
                    // Dynamic import to avoid SSR issues
                    const QRCode = await import('qrcode');

                    // UPI URL Format: upi://pay?pa=<VPA>&pn=<NAME>&am=<AMOUNT>&cu=INR
                    const upiUrl = `upi://pay?pa=${UPI_VPA}&pn=${UPI_NAME}&am=${totalAmount}&cu=INR`;

                    const url = await QRCode.toDataURL(upiUrl, { width: 300, margin: 2 });
                    setQrCodeUrl(url);
                } catch (err) {
                    console.error('QR Generation Error:', err);
                }
            };
            generateQR();
        }
    }, [totalAmount]);

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
        if (paymentMethod === 'MANUAL_UPI') {
            if (!manualDetails.utr || !manualDetails.screenshot) {
                alert('Please enter UTR and upload a screenshot');
                return;
            }

            // Validate UTR: Must be exactly 12 digits
            const utrRegex = /^\d{12}$/;
            if (!utrRegex.test(manualDetails.utr)) {
                alert('Invalid UTR. It must be exactly 12 digits.');
                return;
            }

            setLoading(true);

            try {
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
                    setLoading(false);

                    // Small delay to ensure loading is hidden before showing success
                    setTimeout(() => {
                        setShowSuccess(true);
                    }, 100);

                    // Redirect to home after 5 seconds
                    setTimeout(() => {
                        router.push('/');
                    }, 5000);
                } else {
                    alert(data.error || 'Failed to submit order');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Payment error:', error);
                alert('Something went wrong');
            }

        } else {
            // RAZORPAY FLOW
            alert(`Online Payment is temporarily under maintenance. Please select "Pay via QR Code" to pay ₹${totalAmount} instantly.`);
            return;
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
                <Footer />
            </>
        );
    }

    // Show success overlay even if cart is empty (after successful payment)
    if (showSuccess) {
        return (
            <>
                <Header />
                {/* Payment Success Animation */}
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
                }}>
                    <div style={{ textAlign: 'center' }}>
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

                        {/* Success Text */}
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Payment Submitted!
                        </h1>

                        <p style={{
                            fontSize: '1.25rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '1rem',
                        }}>
                            Your order has been received and will be verified shortly.
                        </p>

                        <p style={{
                            fontSize: '1rem',
                            color: '#10b981',
                            marginBottom: '1.5rem',
                        }}>
                            📧 Account credentials will be sent to your Gmail or Telegram
                        </p>

                        {/* Telegram Support Link */}
                        <a
                            href="https://t.me/BATMANISALIVEEBRO"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.875rem 1.5rem',
                                background: 'linear-gradient(135deg, #0088cc, #00aced)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontWeight: 600,
                                textDecoration: 'none',
                                marginBottom: '1.5rem',
                                boxShadow: '0 4px 20px rgba(0, 136, 204, 0.4)',
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            Contact Us on Telegram
                        </a>

                        {/* Redirect Message */}
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
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '4rem 2rem' }}>
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
                                    {qrCodeUrl ? (
                                        <img
                                            src={qrCodeUrl}
                                            alt="Payment QR"
                                            style={{
                                                width: '200px',
                                                height: '200px',
                                                borderRadius: '8px',
                                                border: '2px solid white'
                                            }}
                                        />
                                    ) : (
                                        <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                            Generating QR...
                                        </div>
                                    )}
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#aaa' }}>
                                        Accepts PhonePe, GPay, Paytm, etc.
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                                        Paying to: <strong>{UPI_VPA}</strong>
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label>Enter UTR / Transaction ID <span style={{ color: 'red' }}>*</span></label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. 123456789012"
                                        value={manualDetails.utr}
                                        maxLength={12}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, ''); // Only allow numbers
                                            setManualDetails({ ...manualDetails, utr: val });
                                        }}
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
                        <>
                            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#aaa' }}>
                                Your order will be verified within 15-30 mins manually.
                            </p>
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: '#10b981', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    📧 Delivery Information
                                </p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    After verification, your account credentials will be delivered to your <strong style={{ color: '#fff' }}>registered Gmail</strong> or via <strong style={{ color: '#fff' }}>Telegram</strong>.
                                </p>
                            </div>
                        </>
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

            {/* Payment Success Animation */}
            {showSuccess && (
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
                    <div style={{
                        textAlign: 'center',
                        animation: 'slideInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        {/* Checkmark Circle */}
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-green), #059669)',
                            margin: '0 auto 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 60px rgba(16, 185, 129, 0.6)',
                            animation: 'checkmarkPop 0.6s ease 0.3s both',
                            position: 'relative'
                        }}>
                            <span style={{
                                fontSize: '4rem',
                                color: 'white',
                                animation: 'checkmarkRotate 0.8s ease 0.5s both'
                            }}>✓</span>

                            {/* Pulse rings */}
                            <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: '3px solid var(--accent-green)',
                                animation: 'pulse 2s ease-out infinite'
                            }}></div>
                        </div>

                        {/* Success Text */}
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, var(--primary-start), var(--primary-end))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'fadeInUp 0.6s ease 0.6s both'
                        }}>
                            Payment Submitted!
                        </h1>

                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '2rem',
                            animation: 'fadeInUp 0.6s ease 0.8s both'
                        }}>
                            Your order has been received and will be verified shortly.
                        </p>

                        {/* Redirect Message */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--glass-border)',
                            animation: 'fadeInUp 0.6s ease 1s both'
                        }}>
                            <div className="spinner" style={{
                                width: '20px',
                                height: '20px',
                                borderWidth: '2px'
                            }}></div>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Redirecting to home in 5 seconds...
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
