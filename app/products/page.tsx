'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IProduct } from '@/models/Product';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function ProductsPage() {
    const { data: session, status } = useSession();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            if (data.success) {
                setProducts(data.products);
                setFilteredProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (productId: string, duration: number, price: number) => {
        // Check if user is logged in
        if (!session) {
            signIn('google', { callbackUrl: '/products' });
            return;
        }

        try {
            const product = products.find((p) => p._id === productId);
            if (!product) return;

            // Create Razorpay order
            const response = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: price,
                    productId,
                    productName: product.name,
                    duration,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                alert('Failed to create payment order. Please try again.');
                return;
            }

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: data.keyId,
                    amount: data.amount,
                    currency: data.currency,
                    name: 'OTT4YOU',
                    description: `${product.platform} - ${duration} Month Subscription`,
                    order_id: data.orderId,
                    handler: async function (response: any) {
                        // Verify payment
                        const verifyResponse = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                productId,
                                productName: product.name,
                                platform: product.platform,
                                duration,
                                amount: price,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            alert('Payment successful! Check your dashboard for details.');
                            window.location.href = '/dashboard';
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: session?.user?.name || '',
                        email: session?.user?.email || '',
                    },
                    theme: {
                        color: '#8b5cf6',
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            };
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('An error occurred. Please try again.');
        }
    };

    // Platform logos mapping
    const platformLogos: { [key: string]: string } = {
        'Prime Video': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/600px-Amazon_Prime_Video_logo.svg.png',
        'Spotify': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/600px-Spotify_logo_without_text.svg.png',
        'YouTube Premium': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/600px-YouTube_full-color_icon_%282017%29.svg.png',
        'JioHotstar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Disney%2B_Hotstar_logo.svg/600px-Disney%2B_Hotstar_logo.svg.png',
        'Jio Saavn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/JioSaavn_Logo.svg/600px-JioSaavn_Logo.svg.png',
        'SonyLIV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/SonyLIV_Logo.svg/600px-SonyLIV_Logo.svg.png',
    };

    return (
        <>
            <Header />
            <main>
                {/* Hero Section */}
                <section className="products-hero">
                    <div className="container">
                        <h1 className="animate-fade-in">
                            Premium <span className="text-gradient">Subscriptions</span>
                        </h1>
                        <p className="animate-fade-in">
                            Choose from our wide range of OTT platforms at unbeatable prices
                        </p>
                    </div>
                </section>

                {/* Search Section */}
                <section className="search-section">
                    <div className="container">
                        <SearchBar
                            products={products}
                            onFilterChange={setFilteredProducts}
                        />
                    </div>
                </section>

                {/* Login Prompt for Non-Logged Users */}
                {status === 'unauthenticated' && (
                    <section className="login-prompt">
                        <div className="container">
                            <div className="login-prompt-card">
                                <span className="login-icon">🔐</span>
                                <div className="login-prompt-text">
                                    <strong>Sign in to purchase subscriptions</strong>
                                    <p>Login with Google to access all features and start buying</p>
                                </div>
                                <button
                                    onClick={() => signIn('google', { callbackUrl: '/products' })}
                                    className="btn btn-primary btn-glow"
                                >
                                    Sign In to Continue
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Products Grid */}
                <section className="section" style={{ padding: '4rem 0' }}>
                    <div className="container products-grid-container">
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                                <div className="spinner" />
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="masonry-grid">
                                {filteredProducts.map((product) => (
                                    <div key={product._id} className="masonry-item">
                                        <ProductCard
                                            product={product}
                                            onPurchase={handlePurchase}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                                    {products.length > 0 ? 'No products match your filters.' : 'No products available at the moment.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
