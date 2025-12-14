'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderStats {
    totalOrders: number;
    totalSpent: number;
    recentOrders: any[];
}

export default function HomePage() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session) {
            fetchUserStats();
        }
    }, [session]);

    const fetchUserStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();
            if (data.success) {
                const orders = data.orders || [];
                const totalSpent = orders.reduce((sum: number, order: any) => sum + order.amount, 0);
                setStats({
                    totalOrders: orders.length,
                    totalSpent,
                    recentOrders: orders.slice(0, 3),
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Platform data with accurate brand logos
    const platforms = [
        {
            name: 'Prime Video',
            logo: 'https://cdn.simpleicons.org/primevideo/00A8E1',
            color: '#00A8E1'
        },
        {
            name: 'Spotify',
            logo: 'https://cdn.simpleicons.org/spotify/1DB954',
            color: '#1DB954'
        },
        {
            name: 'YouTube',
            logo: 'https://cdn.simpleicons.org/youtube/FF0000',
            color: '#FF0000'
        },
        {
            name: 'Hotstar',
            logo: 'https://cdn.simpleicons.org/hotstar/1F80E0',
            color: '#1F80E0'
        },
        {
            name: 'JioSaavn',
            logo: 'https://cdn.simpleicons.org/jiosaavn/2BC5B4',
            color: '#2BC5B4'
        },
        {
            name: 'SonyLIV',
            logo: 'https://cdn.simpleicons.org/sony/000000',
            color: '#E50914'
        },
    ];

    return (
        <>
            <Header />
            <main>
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="container">
                        <div className="hero-content">
                            <h1 className="hero-title animate-fade-in">
                                Get Premium <span className="text-gradient">OTT Subscriptions</span> at Unbeatable Prices
                            </h1>
                            <p className="hero-subtitle animate-fade-in">
                                Access your favorite streaming platforms – Prime Video, Spotify, YouTube Premium and more at prices you won't find anywhere else!
                            </p>
                            <div className="hero-buttons animate-fade-in">
                                <Link href="/products" className="btn btn-primary btn-lg btn-glow">
                                    Browse Subscriptions
                                </Link>
                                {session ? (
                                    <Link href="/dashboard" className="btn btn-secondary btn-lg">
                                        View My Orders
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => signIn('google', { callbackUrl: '/' })}
                                        className="btn btn-secondary btn-lg"
                                    >
                                        Sign In / Sign Up
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* User Stats Section (Only for logged in users) */}
                {session && (
                    <section className="user-stats-section">
                        <div className="container">
                            <div className="stats-header">
                                <h2>Welcome back, {session.user?.name?.split(' ')[0]}! 👋</h2>
                                <p>Here's your account overview</p>
                            </div>

                            {loading ? (
                                <div className="loading-stats">
                                    <div className="spinner" />
                                </div>
                            ) : stats ? (
                                <>
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-icon">🛒</div>
                                            <div className="stat-info">
                                                <span className="stat-value">{stats.totalOrders}</span>
                                                <span className="stat-label">Total Purchases</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">💰</div>
                                            <div className="stat-info">
                                                <span className="stat-value">₹{stats.totalSpent}</span>
                                                <span className="stat-label">Total Spent</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">🎬</div>
                                            <div className="stat-info">
                                                <span className="stat-value">{stats.totalOrders > 0 ? 'Active' : 'None'}</span>
                                                <span className="stat-label">Subscriptions</span>
                                            </div>
                                        </div>
                                    </div>

                                    {stats.recentOrders.length > 0 && (
                                        <div className="recent-orders">
                                            <h3>Recent Purchases</h3>
                                            <div className="orders-list">
                                                {stats.recentOrders.map((order: any, index: number) => (
                                                    <div key={index} className="order-item">
                                                        <div className="order-info">
                                                            <strong>{order.productName}</strong>
                                                            <span>{order.platform} • {order.duration} Month(s)</span>
                                                        </div>
                                                        <div className="order-amount">₹{order.amount}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                                                View All Orders →
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="no-orders-message">
                                    <p>You haven't made any purchases yet.</p>
                                    <Link href="/products" className="btn btn-primary">
                                        Browse Subscriptions
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Explore Section */}
                <section className="explore-section">
                    <div className="container">
                        <h2 className="section-title">Explore Our Catalog</h2>
                        <p className="section-subtitle">Premium streaming services at your fingertips</p>

                        <div className="explore-card">
                            <div className="explore-logos">
                                {platforms.map((platform, index) => (
                                    <Link href="/products" key={index} className="platform-logo-wrapper" title={platform.name}>
                                        <div className="platform-logo-circle" style={{ background: `${platform.color}20` }}>
                                            <Image
                                                src={platform.logo}
                                                alt={platform.name}
                                                width={50}
                                                height={50}
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                        <span className="platform-label">{platform.name}</span>
                                    </Link>
                                ))}
                            </div>
                            <div className="explore-cta">
                                <h3>Ready to Start Streaming?</h3>
                                <p>Browse our collection and find the perfect subscription for you!</p>
                                <Link href="/products" className="btn btn-primary btn-lg btn-glow">
                                    View All Products →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <div className="container">
                        <h2 className="section-title animate-slide-up">Why Choose <span className="text-gradient">OTT4YOU</span>?</h2>
                        <p className="section-subtitle animate-slide-up">We offer the best deals on premium streaming subscriptions</p>
                        <div className="features-grid">
                            <div className="feature-card animate-pop-in" style={{ animationDelay: '0.1s' }}>
                                <div className="feature-icon">💸</div>
                                <h3>Half Prices</h3>
                                <p>Get premium OTT subscriptions at almost 50% less than official prices. Save big on every purchase!</p>
                            </div>
                            <div className="feature-card animate-pop-in" style={{ animationDelay: '0.2s' }}>
                                <div className="feature-icon">✨</div>
                                <h3>Real Quality</h3>
                                <p>100% genuine accounts with full HD/4K streaming quality. No compromises on your entertainment.</p>
                            </div>
                            <div className="feature-card animate-pop-in" style={{ animationDelay: '0.3s' }}>
                                <div className="feature-icon">🆕</div>
                                <h3>Fresh Accounts</h3>
                                <p>Brand new, unused accounts every time. No shared access, fully dedicated to you!</p>
                            </div>
                            <div className="feature-card animate-pop-in" style={{ animationDelay: '0.4s' }}>
                                <div className="feature-icon">⚡</div>
                                <h3>Instant Delivery</h3>
                                <p>Get your account credentials within minutes of payment. Start streaming right away!</p>
                            </div>
                            <div className="feature-card animate-pop-in" style={{ animationDelay: '0.5s' }}>
                                <div className="feature-icon">🔒</div>
                                <h3>Secure Payments</h3>
                                <p>All transactions secured with Razorpay. 100% safe and encrypted payments.</p>
                            </div>
                            <div className="feature-card animate-pop-in" style={{ animationDelay: '0.6s' }}>
                                <div className="feature-icon">🎧</div>
                                <h3>24/7 Support</h3>
                                <p>Our support team is always ready to help you with any issues. Email us anytime!</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
