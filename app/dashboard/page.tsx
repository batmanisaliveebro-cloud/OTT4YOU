import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function DashboardPage() {
    const session = await auth() as any;

    if (!session || !session.user) {
        redirect('/');
    }

    await connectDB();
    const orders = await Order.find({ userId: (session.user as any).id })
        .sort({ purchaseDate: -1 })
        .lean();

    return (
        <>
            <Header />
            <main className="container section">
                <h1 style={{ marginBottom: '2rem' }}>My Dashboard</h1>

                <div style={{ marginBottom: '3rem' }}>
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                            {session.user.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        border: '3px solid var(--primary-start)',
                                    }}
                                />
                            )}
                            <div>
                                <h2 style={{ marginBottom: '0.5rem' }}>{session.user.name}</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>{session.user.email}</p>
                                {session.user.role === 'admin' && (
                                    <span className="badge badge-warning" style={{ marginTop: '0.5rem' }}>
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Purchase History</h2>

                    {orders.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                No purchases yet. Browse our subscriptions to get started!
                            </p>
                            <a href="/#products" className="btn btn-primary">
                                Browse Subscriptions
                            </a>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map((order: any) => (
                                <div key={order._id.toString()} className="glass-card">
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        flexWrap: 'wrap',
                                        gap: '1rem',
                                    }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                                                {order.productName}
                                            </h3>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                                {order.platform} • {order.duration} {order.duration === 1 ? 'Month' : 'Months'}
                                            </p>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                Purchased on {new Date(order.purchaseDate).toLocaleDateString()}
                                            </p>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                Payment ID: {order.paymentId}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '1.75rem',
                                                fontWeight: 700,
                                                color: 'var(--primary-start)',
                                                marginBottom: '0.5rem',
                                            }}>
                                                ₹{order.amount}
                                            </div>
                                            <span className={`badge ${order.status === 'completed' ? 'badge-success' :
                                                order.status === 'pending' ? 'badge-warning' :
                                                    'badge-danger'
                                                }`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {orders.length > 0 && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '2rem',
                        background: 'var(--glass-bg)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--glass-border)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem' }}>Total Spent</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {orders.length} {orders.length === 1 ? 'purchase' : 'purchases'}
                                </p>
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                            }} className="text-gradient">
                                ₹{orders.reduce((sum: number, order: any) => sum + order.amount, 0)}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
