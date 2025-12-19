'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import CartCount from './CartCount';
import { useCart } from '@/context/CartContext';

export default function Header() {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const { itemCount } = useCart();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            {/* Top Contact Bar - Hidden on mobile */}
            {!isMobile && (
                <div className="contact-bar">
                    <div className="container contact-bar-content">
                        <span>Need Help?</span>
                        <a href="mailto:batmanisaliveebro@gmail.com" className="contact-email">
                            📧 batmanisaliveebro@gmail.com
                        </a>
                    </div>
                </div>
            )}

            {/* Main Header */}
            <header className="header-glass">
                <div className="header-container">
                    <Link href="/" className="logo-text">
                        OTT4YOU
                    </Link>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <nav className="nav-links">
                            <Link href="/" className="nav-link">Home</Link>
                            <Link href="/products" className="nav-link">Products</Link>

                            {itemCount > 0 && (
                                <Link href="/cart" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span>Cart</span>
                                    <CartCount />
                                </Link>
                            )}

                            {session ? (
                                <>
                                    <Link href="/dashboard" className="nav-link">My Orders</Link>
                                    <Link href="/profile" className="nav-link">Profile</Link>
                                    {(session.user as any)?.role === 'admin' && (
                                        <Link href="/admin" className="nav-link admin-link">Admin</Link>
                                    )}
                                    <div className="user-section">
                                        {session.user?.image && (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || 'User'}
                                                width={36}
                                                height={36}
                                                className="user-avatar"
                                            />
                                        )}
                                        <span className="user-name">{session.user?.name?.split(' ')[0]}</span>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => signIn('google', { callbackUrl: '/' })}
                                    className="google-signin-btn"
                                >
                                    <span>Sign In</span>
                                </button>
                            )}
                        </nav>
                    )}

                    {/* Mobile: Cart + Menu Button */}
                    {isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {itemCount > 0 && (
                                <Link
                                    href="/cart"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    🛒 <CartCount />
                                </Link>
                            )}
                            <button
                                className="mobile-menu-btn"
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="Toggle menu"
                            >
                                {menuOpen ? '✕' : '☰'}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobile && menuOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, rgba(15, 15, 30, 0.98), rgba(26, 26, 46, 0.98))',
                    backdropFilter: 'blur(20px)',
                    zIndex: 9998,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '80px 1.5rem 2rem',
                    animation: 'fadeIn 0.2s ease',
                    overflowY: 'auto',
                }}>
                    {/* User Section */}
                    {session && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '16px',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                        }}>
                            {session.user?.image && (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    width={50}
                                    height={50}
                                    style={{ borderRadius: '50%' }}
                                />
                            )}
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{session.user?.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{session.user?.email}</div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <Link href="/" onClick={closeMenu} style={navButtonStyle}>
                            <span style={{ fontSize: '1.25rem' }}>🏠</span>
                            <span>Home</span>
                        </Link>

                        <Link href="/products" onClick={closeMenu} style={navButtonStyle}>
                            <span style={{ fontSize: '1.25rem' }}>📦</span>
                            <span>Products</span>
                        </Link>

                        {session && (
                            <>
                                <Link href="/dashboard" onClick={closeMenu} style={navButtonStyle}>
                                    <span style={{ fontSize: '1.25rem' }}>📋</span>
                                    <span>My Orders</span>
                                </Link>

                                <Link href="/profile" onClick={closeMenu} style={navButtonStyle}>
                                    <span style={{ fontSize: '1.25rem' }}>👤</span>
                                    <span>Profile</span>
                                </Link>

                                {(session.user as any)?.role === 'admin' && (
                                    <Link href="/admin" onClick={closeMenu} style={{
                                        ...navButtonStyle,
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                    }}>
                                        <span style={{ fontSize: '1.25rem' }}>⚙️</span>
                                        <span>Admin Panel</span>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

                    {/* Contact Support Section */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Contact Support
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                            <a
                                href="https://t.me/akhilescrow?text=Hi%2C%20I%20need%20help%20with%20my%20OTT4YOU%20order.%20Issue%3A%20"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={closeMenu}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    background: 'linear-gradient(135deg, #0088cc, #0077b5)',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                }}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                                Chat on Telegram
                            </a>
                            <a
                                href="mailto:batmanisaliveebro@gmail.com?subject=OTT4YOU%20Support%20-%20Need%20Help&body=Hi%20OTT4YOU%20Team%2C%0A%0AI%20need%20help%20with%20my%20order.%0A%0AIssue%3A%20%0A%0AOrder%20ID%20(if%20applicable)%3A%20%0A%0AThanks!"
                                onClick={closeMenu}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    background: 'linear-gradient(135deg, #ea4335, #d93025)',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                }}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                                Email Support
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Section */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Quick Links
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <Link href="/terms" onClick={closeMenu} style={smallButtonStyle}>Terms</Link>
                            <Link href="/refund-policy" onClick={closeMenu} style={smallButtonStyle}>Refund</Link>
                            <Link href="/shipping-policy" onClick={closeMenu} style={smallButtonStyle}>Shipping</Link>
                        </div>
                    </div>

                    {/* Auth Button */}
                    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                        {session ? (
                            <button
                                onClick={() => { signOut({ callbackUrl: '/' }); closeMenu(); }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                }}
                            >
                                Sign Out
                            </button>
                        ) : (
                            <button
                                onClick={() => { signIn('google', { callbackUrl: '/' }); closeMenu(); }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

// Styles for navigation buttons
const navButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '1rem',
    transition: 'all 0.2s',
};

const smallButtonStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    fontSize: '0.8rem',
};

