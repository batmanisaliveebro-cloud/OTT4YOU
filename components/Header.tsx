'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            {/* Top Contact Bar */}
            <div className="contact-bar">
                <div className="container contact-bar-content">
                    <span>Need Help?</span>
                    <a href="mailto:batmanisaliveebro@gmail.com" className="contact-email">
                        📧 batmanisaliveebro@gmail.com
                    </a>
                </div>
            </div>

            {/* Main Header */}
            <header className="header-glass">
                <div className="header-container">
                    <Link href="/" className="logo-text">
                        OTT4YOU
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>

                    {/* Navigation */}
                    <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
                        <Link href="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                            Home
                        </Link>
                        <Link href="/products" className="nav-link" onClick={() => setMenuOpen(false)}>
                            Products
                        </Link>

                        {session ? (
                            <>
                                <Link href="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    My Orders
                                </Link>
                                <Link href="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    Profile
                                </Link>

                                {(session.user as any)?.role === 'admin' && (
                                    <Link href="/admin" className="nav-link admin-link" onClick={() => setMenuOpen(false)}>
                                        Admin
                                    </Link>
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
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Sign in with Google</span>
                            </button>
                        )}
                    </nav>
                </div>
            </header>
        </>
    );
}
