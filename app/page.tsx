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
    const [publicStats, setPublicStats] = useState<{ totalRevenue: number, totalOrders: number, totalUsers: number } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session) {
            fetchUserStats();
        }
        // Fetch global stats
        fetch('/api/stats/public').then(res => res.json()).then(data => {
            if (data.success) {
                setPublicStats({
                    totalRevenue: data.totalRevenue,
                    totalOrders: data.totalOrders,
                    totalUsers: data.totalUsers
                });
            }
        });
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

    return (
        <>
            <Header />
            <main>
                {/* Hero Section - Premium */}
                <section style={{
                    minHeight: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(15, 15, 30, 1) 0%, rgba(26, 26, 46, 1) 50%, rgba(40, 20, 60, 1) 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: 'clamp(6rem, 15vh, 8rem) 0 4rem',
                }}>
                    {/* Animated background elements */}
                    <div style={{
                        position: 'absolute',
                        top: '10%',
                        right: '10%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(40px)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '20%',
                        left: '5%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(30px)',
                    }} />

                    <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        {/* Premium Badge */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.375rem 0.75rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '50px',
                            marginBottom: '1rem',
                            fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
                            color: '#a78bfa',
                        }}>
                            <span>⭐</span>
                            <span>Premium OTT</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(1.75rem, 6vw, 3.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.15,
                            marginBottom: '1rem',
                            maxWidth: '700px',
                            margin: '0 auto 1.5rem',
                        }}>
                            Premium <span style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>OTT</span> at <span style={{ color: '#10b981' }}>50% OFF</span>
                        </h1>

                        <p style={{
                            fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxWidth: '500px',
                            margin: '0 auto 2rem',
                            lineHeight: 1.6,
                            padding: '0 0.5rem',
                        }}>
                            Prime Video, Spotify, YouTube Premium & more. Instant delivery!
                        </p>

                        {/* CTA Button */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                            <Link href="/products" style={{
                                padding: 'clamp(0.8rem, 2.5vw, 1rem) clamp(2rem, 5vw, 3rem)',
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                borderRadius: '12px',
                                color: '#fff',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                                transition: 'transform 0.2s',
                            }}>
                                Browse Subscriptions →
                            </Link>
                        </div>

                        {/* Live User Proof */}
                        {publicStats && (
                            <div style={{
                                marginTop: '0.5rem',
                                marginBottom: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                animation: 'fadeIn 1s ease-out'
                            }}>
                                <div style={{ color: '#f59e0b', fontSize: '1.1rem', letterSpacing: '2px' }}>★★★★★</div>
                                <div style={{
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: '0.95rem',
                                    fontWeight: 500
                                }}>
                                    Trusted by <span style={{ color: '#fff', fontWeight: 700 }}>{publicStats.totalUsers > 1 ? `${publicStats.totalUsers}+` : '100+'}</span> happy subscribers
                                </div>
                            </div>
                        )}

                        {/* Payment Partners Badge */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '1.5rem 2rem',
                            display: 'inline-block',
                        }}>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                Official Payment Partners
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                                {/* Cashfree Logo */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    borderRadius: '8px',
                                }}>
                                    <span style={{ fontSize: '1.25rem' }}>💳</span>
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Cashfree</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>UPI</span>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Cards</span>
                                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>NetBanking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Indicators Strip */}
                <section style={{
                    background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                    padding: '1rem 0',
                }}>
                    <div className="container">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '3rem',
                            flexWrap: 'wrap',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                <span style={{ fontSize: '1.25rem' }}>🔒</span>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>100% Secure</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Instant Delivery</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                <span style={{ fontSize: '1.25rem' }}>✅</span>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Genuine Accounts</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                <span style={{ fontSize: '1.25rem' }}>🎧</span>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* User Welcome Section */}
                {session && (
                    <section style={{ padding: '3rem 0', background: 'var(--bg-secondary)' }}>
                        <div className="container">
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '20px',
                                padding: '2rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {session.user?.image && (
                                        <Image
                                            src={session.user.image}
                                            alt={session.user.name || 'User'}
                                            width={60}
                                            height={60}
                                            style={{ borderRadius: '50%', border: '3px solid #8b5cf6' }}
                                        />
                                    )}
                                    <div>
                                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                            Welcome back, {session.user?.name?.split(' ')[0]}! 👋
                                        </h2>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </div>

                                {stats && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{stats.totalOrders}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Orders</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>₹{stats.totalSpent}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Saved</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                                                <div style={{ fontSize: '1.5rem' }}>📋</div>
                                                <div style={{ fontSize: '0.85rem', color: '#8b5cf6', fontWeight: 600 }}>View Orders</div>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Features Section - Compact */}
                <section style={{ padding: '2.5rem 0' }}>
                    <div className="container">
                        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', marginBottom: '1.5rem' }}>
                            Why <span style={{ color: '#8b5cf6' }}>OTT4YOU</span>?
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1rem',
                        }}>
                            {[
                                { icon: '💸', title: 'Save 50%', desc: 'Half the official price' },
                                { icon: '✨', title: 'Genuine', desc: 'Authentic HD/4K accounts' },
                                { icon: '⚡', title: 'Instant', desc: 'Delivery in minutes' },
                                { icon: '🔒', title: 'Secure', desc: 'Cashfree protected' },
                            ].map((feature, index) => (
                                <div key={index} style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600 }}>{feature.title}</h3>
                                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>



                {/* Payment Partners Section */}
                <section style={{ padding: '3rem 0' }}>
                    <div className="container" style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>Trusted Payment Partner</h3>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '1rem',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '16px',
                            padding: '1.5rem 3rem',
                        }}>
                            <span style={{ fontSize: '2.5rem' }}>💳</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>Cashfree Payments</div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Secure • Fast • Reliable</div>
                            </div>
                        </div>
                        <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                            All transactions are encrypted and protected.
                        </p>
                    </div>
                </section>
            </main >
            <Footer />
        </>
    );
}
