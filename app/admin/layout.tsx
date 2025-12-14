import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || (session.user as any)?.role !== 'admin') {
        redirect('/');
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--glass-border)',
                padding: '2rem 0',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto',
            }}>
                <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
                    <Link href="/" style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                    }} className="text-gradient">
                        OTT4YOU Admin
                    </Link>
                </div>

                <nav style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    padding: '0 1rem',
                }}>
                    <Link
                        href="/admin"
                        style={{
                            padding: '0.875rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 500,
                        }}
                        className="admin-nav-link"
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        href="/admin/products"
                        style={{
                            padding: '0.875rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 500,
                        }}
                        className="admin-nav-link"
                    >
                        📦 Products
                    </Link>
                    <Link
                        href="/admin/orders"
                        style={{
                            padding: '0.875rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 500,
                        }}
                        className="admin-nav-link"
                    >
                        🛒 Orders
                    </Link>
                    <Link
                        href="/admin/users"
                        style={{
                            padding: '0.875rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 500,
                        }}
                        className="admin-nav-link"
                    >
                        👥 Users
                    </Link>
                    <Link
                        href="/admin/settings"
                        style={{
                            padding: '0.875rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 500,
                        }}
                        className="admin-nav-link"
                    >
                        ⚙️ Settings
                    </Link>
                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }} />
                    <Link
                        href="/"
                        style={{
                            padding: '0.875rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: 'var(--text-secondary)',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 500,
                        }}
                        className="admin-nav-link"
                    >
                        ← Back to Site
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{
                marginLeft: '280px',
                flex: 1,
                padding: '2rem 3rem',
                minHeight: '100vh',
            }}>
                {children}
            </main>
        </div>
    );
}
