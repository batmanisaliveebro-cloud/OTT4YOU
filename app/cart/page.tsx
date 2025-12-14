'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CartPage() {
    const { items, removeFromCart, totalAmount, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();

    const handleCheckout = () => {
        if (!session) {
            signIn('google', { callbackUrl: '/checkout' });
        } else {
            router.push('/checkout');
        }
    };

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '4rem 1rem', minHeight: '80vh' }}>
                <h1 className="section-title">Shopping Cart</h1>

                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                        <h2>Your cart is empty</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Looks like you haven't added any subscriptions yet.
                        </p>
                        <Link href="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="cart-grid">
                        <div className="cart-items">
                            {items.map((item) => (
                                <div key={item.id} className="glass-card cart-item">
                                    <div className="cart-img-wrapper" style={{
                                        width: '80px',
                                        height: '80px',
                                        position: 'relative',
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                        background: 'var(--bg-tertiary)',
                                        flexShrink: 0,
                                    }}>
                                        <Image
                                            src={item.logo}
                                            alt={item.platform}
                                            fill
                                            style={{ objectFit: 'contain', padding: '0.5rem' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3>{item.platform}</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>
                                            {item.duration} Month{item.duration > 1 ? 's' : ''} Plan
                                        </p>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            Price: ₹{item.price} x {item.quantity}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            ₹{item.price * item.quantity}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={clearCart}
                                className="btn btn-outline"
                                style={{ marginTop: '1rem' }}
                            >
                                Clear Cart
                            </button>
                        </div>

                        <div className="cart-summary glass-card" style={{ height: 'fit-content' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                                color: 'var(--text-secondary)'
                            }}>
                                <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                                <span>₹{totalAmount}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '1.5rem',
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                borderTop: '1px solid var(--glass-border)',
                                paddingTop: '1rem'
                            }}>
                                <span>Total</span>
                                <span>₹{totalAmount}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="btn btn-primary full-width btn-lg btn-glow"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
