'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
    const { data: session } = useSession();

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--glass-border)',
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 2rem',
            }}>
                <Link href="/" style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--primary-start), var(--primary-end))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textDecoration: 'none',
                }}>
                    OTT4YOU
                </Link>

                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s' }}>
                        Home
                    </Link>

                    {session ? (
                        <>
                            <Link href="/dashboard" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                                Dashboard
                            </Link>

                            {(session.user as any)?.role === 'admin' && (
                                <Link href="/admin" style={{ color: 'var(--accent-pink)', textDecoration: 'none', fontWeight: 600 }}>
                                    Admin Panel
                                </Link>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {session.user?.image && (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        width={40}
                                        height={40}
                                        style={{ borderRadius: '50%', border: '2px solid var(--primary-start)' }}
                                    />
                                )}
                                <span style={{ color: 'var(--text-secondary)' }}>{session.user?.name}</span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1.5rem' }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            className="btn btn-primary"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
