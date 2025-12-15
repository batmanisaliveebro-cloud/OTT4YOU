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

    return (
        <>
            <Header />
            <main>
                {/* Hero Section - Premium */}
                <section style={{
                    minHeight: '85vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(15, 15, 30, 1) 0%, rgba(26, 26, 46, 1) 50%, rgba(40, 20, 60, 1) 100%)',
                    position: 'relative',
                    overflow: 'hidden',
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
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '50px',
                            marginBottom: '1.5rem',
                            fontSize: '0.85rem',
                            color: '#a78bfa',
                        }}>
                            <span>⭐</span>
                            <span>Premium OTT Subscriptions</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 6vw, 4rem)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            maxWidth: '900px',
                            margin: '0 auto 1.5rem',
                        }}>
                            Get Premium <span style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #a78bfa)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>OTT Subscriptions</span><br />
                            at <span style={{ color: '#10b981' }}>50% OFF</span>
                        </h1>

                        <p style={{
                            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxWidth: '600px',
                            margin: '0 auto 2rem',
                            lineHeight: 1.6,
                        }}>
                            Access Prime Video, Spotify, YouTube Premium & more at unbeatable prices. Instant delivery, genuine accounts!
                        </p>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
                            <Link href="/products" style={{
                                padding: '1rem 2.5rem',
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                borderRadius: '12px',
                                color: '#fff',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}>
                                Browse Subscriptions →
                            </Link>
                            {!session && (
                                <button
                                    onClick={() => signIn('google', { callbackUrl: '/' })}
                                    style={{
                                        padding: '1rem 2rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>

                        {/* Payment Partners Badge */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '1.5rem 2rem',
                            display: 'inline-block',
                        }}>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Secure Payments Powered By
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
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
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

                {/* Features Section */}
                <section style={{ padding: '4rem 0' }}>
                    <div className="container">
                        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
                            Why Choose <span style={{ color: '#8b5cf6' }}>OTT4YOU</span>?
                        </h2>
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                            India's most trusted OTT subscription marketplace
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem',
                        }}>
                            {[
                                { icon: '💸', title: 'Save 50%', desc: 'Get premium subscriptions at half the official price. Best deals guaranteed!' },
                                { icon: '✨', title: 'Genuine Accounts', desc: '100% authentic accounts with full HD/4K quality. No compromises.' },
                                { icon: '⚡', title: 'Instant Delivery', desc: 'Get your credentials within minutes. Start streaming immediately!' },
                                { icon: '🔒', title: 'Secure Payments', desc: 'Protected by Cashfree. UPI, Cards, NetBanking accepted.' },
                                { icon: '🔄', title: 'Free Replacements', desc: 'Account issues? We provide free replacements within warranty.' },
                                { icon: '🎧', title: '24/7 Support', desc: 'Round the clock support via Email & Telegram. We are always here!' },
                            ].map((feature, index) => (
                                <div key={index} style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    transition: 'transform 0.2s, border-color 0.2s',
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{feature.title}</h3>
                                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: 1.6 }}>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Available Platforms */}
                <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)' }}>
                    <div className="container">
                        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '2rem' }}>
                            Available Platforms
                        </h2>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '2rem',
                            flexWrap: 'wrap',
                        }}>
                            {[
                                { name: 'Prime Video', logo: '/logos/prime-video.jpg' },
                                { name: 'Spotify', logo: '/logos/spotify.png' },
                                { name: 'YouTube Premium', logo: '/logos/youtube-premium.jpg' },
                                { name: 'JioHotstar', logo: '/logos/jiohotstar.jpg' },
                                { name: 'JioSaavn', logo: '/logos/jiosaavn.png' },
                                { name: 'SonyLIV', logo: '/logos/sonyliv.jpg' },
                            ].map((platform, index) => (
                                <Link href="/products" key={index} style={{
                                    width: '80px',
                                    height: '80px',
                                    position: 'relative',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'transform 0.2s',
                                }}>
                                    <Image src={platform.logo} alt={platform.name} fill style={{ objectFit: 'contain', padding: '0.5rem' }} />
                                </Link>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <Link href="/products" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#8b5cf6',
                                fontSize: '1rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}>
                                View All Subscriptions →
                            </Link>
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
                            All transactions are encrypted and protected. We never store your payment details.
                        </p>
                    </div>
                </section>

                {/* Contact Support Section */}
                <section style={{ padding: '3rem 0', background: 'var(--bg-secondary)' }}>
                    <div className="container" style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '0.5rem' }}>
                            Need <span style={{ color: '#8b5cf6' }}>Help?</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                            Our support team is available 24/7. Reach out to us anytime!
                        </p>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '1.5rem',
                            flexWrap: 'wrap',
                        }}>
                            {/* Telegram Button */}
                            <a
                                href="https://t.me/akhilescrow?text=Hi%2C%20I%20need%20help%20with%20my%20OTT4YOU%20order.%20Issue%3A%20"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.25rem 2rem',
                                    background: 'linear-gradient(135deg, #0088cc, #0077b5)',
                                    borderRadius: '16px',
                                    textDecoration: 'none',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 20px rgba(0, 136, 204, 0.3)',
                                    transition: 'transform 0.2s',
                                }}
                            >
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                                <span>Chat on Telegram</span>
                            </a>

                            {/* Gmail Button */}
                            <a
                                href="mailto:batmanisaliveebro@gmail.com?subject=OTT4YOU%20Support%20-%20Need%20Help&body=Hi%20OTT4YOU%20Team%2C%0A%0AI%20need%20help%20with%20my%20order.%0A%0AIssue%3A%20%0A%0AOrder%20ID%20(if%20applicable)%3A%20%0A%0AThanks!"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.25rem 2rem',
                                    background: 'linear-gradient(135deg, #ea4335, #d93025)',
                                    borderRadius: '16px',
                                    textDecoration: 'none',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 20px rgba(234, 67, 53, 0.3)',
                                    transition: 'transform 0.2s',
                                }}
                            >
                                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                                <span>Email Support</span>
                            </a>
                        </div>

                        <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                            Average response time: 10-15 minutes
                        </p>
                    </div>
                </section>
            </main >
            <Footer />
        </>
    );
}
