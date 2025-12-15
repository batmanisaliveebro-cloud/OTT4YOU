import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
            {/* Trust & Payment Badges */}
            <div style={{
                padding: '2rem 0',
                background: 'rgba(139, 92, 246, 0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div className="container">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap',
                    }}>
                        {/* Trust Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>🔒</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Secure Payments</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>256-bit SSL</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>⚡</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Instant Delivery</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Within Minutes</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>✅</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>5000+ Customers</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Trusted</div>
                            </div>
                        </div>
                        {/* Cashfree Badge */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                            borderRadius: '8px',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>💳</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#8b5cf6' }}>Cashfree</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Payment Partner</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container" style={{ padding: '2.5rem 1rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem',
                }}>
                    {/* Brand */}
                    <div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            marginBottom: '0.75rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>OTT4YOU</h3>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '1rem' }}>
                            India's trusted destination for premium OTT subscriptions at unbeatable prices.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <a href="mailto:batmanisaliveebro@gmail.com" style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}>📧</a>
                            <a href="https://t.me/akhilescrow" target="_blank" rel="noopener noreferrer" style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}>✈️</a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'Products', href: '/products' },
                                { label: 'My Orders', href: '/dashboard' },
                            ].map((link, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>
                                    <Link href={link.href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Platforms */}
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>Platforms</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {['Prime Video', 'Spotify', 'YouTube Premium', 'JioHotstar', 'JioSaavn', 'SonyLIV'].map((platform, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>
                                    <Link href="/products" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>
                                        {platform}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>Support</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {[
                                { label: 'Contact Us', href: 'mailto:batmanisaliveebro@gmail.com', external: true },
                                { label: 'Terms & Conditions', href: '/terms' },
                                { label: 'Refund Policy', href: '/refund-policy' },
                                { label: 'Shipping Policy', href: '/shipping-policy' },
                            ].map((link, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>
                                    {link.external ? (
                                        <a href={link.href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link href={link.href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                }}>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        © {new Date().getFullYear()} OTT4YOU. All rights reserved.
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        Made with ❤️ in India
                    </p>
                </div>
            </div>
        </footer>
    );
}
