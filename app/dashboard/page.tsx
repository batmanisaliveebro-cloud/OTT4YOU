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
                                                Payment ID: {order.paymentId || 'Pending'}
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
                                                order.status === 'pending' || order.status === 'pending_verification' ? 'badge-warning' :
                                                    'badge-danger'
                                                }`}>
                                                {order.status === 'pending_verification' ? 'Pending Verification' :
                                                    order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status-specific messages */}
                                    {order.status === 'failed' && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '8px',
                                        }}>
                                            <p style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 500 }}>
                                                ❌ Incorrect payment details. Please contact support if you believe this is an error.
                                            </p>
                                        </div>
                                    )}

                                    {order.status === 'completed' && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '8px',
                                        }}>
                                            <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                                ✅ Check your registered email for account credentials!
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                Need help? Contact us on Telegram: <a href="https://t.me/akhilescrow" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontWeight: 600 }}>@akhilescrow</a>
                                            </p>
                                        </div>
                                    )}

                                    {(order.status === 'pending' || order.status === 'pending_verification') && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            borderRadius: '8px',
                                        }}>
                                            <p style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 500 }}>
                                                ⏳ Your payment is being verified. This usually takes 15-30 minutes.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {orders.length > 0 && (() => {
                    const successfulOrders = orders.filter((o: any) => o.status === 'completed');
                    const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'pending_verification');
                    const failedOrders = orders.filter((o: any) => o.status === 'failed');
                    const successfulAmount = successfulOrders.reduce((sum: number, o: any) => sum + o.amount, 0);
                    const pendingAmount = pendingOrders.reduce((sum: number, o: any) => sum + o.amount, 0);
                    const failedAmount = failedOrders.reduce((sum: number, o: any) => sum + o.amount, 0);

                    return (
                        <div style={{ marginTop: '2rem' }}>
                            {/* Stats Grid */}
                            <div className="dashboard-stats-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1rem',
                                marginBottom: '1.5rem',
                            }}>
                                {/* Successful */}
                                <div style={{
                                    padding: '1.25rem',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: '0.5rem' }}>✅ Successful</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{successfulOrders.length}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>₹{successfulAmount}</div>
                                </div>

                                {/* Pending */}
                                <div style={{
                                    padding: '1.25rem',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#f59e0b', marginBottom: '0.5rem' }}>⏳ Pending</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{pendingOrders.length}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>₹{pendingAmount}</div>
                                </div>

                                {/* Failed */}
                                <div style={{
                                    padding: '1.25rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '0.5rem' }}>❌ Failed</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{failedOrders.length}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>₹{failedAmount}</div>
                                </div>
                            </div>

                            {/* Total Section */}
                            <div style={{
                                padding: '1.5rem',
                                background: 'var(--glass-bg)',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                            }}>
                                <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h3 style={{ marginBottom: '0.25rem' }}>Total Orders</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {orders.length} {orders.length === 1 ? 'purchase' : 'purchases'}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 700 }} className="text-gradient">
                                            ₹{orders.reduce((sum: number, order: any) => sum + order.amount, 0)}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </main>
            <Footer />
        </>
    );
}
