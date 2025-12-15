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

    // Find orders by userId OR userEmail for flexibility
    const orders = await Order.find({
        $or: [
            { userId: session.user.id },
            { userId: session.user.email },
            { userEmail: session.user.email }
        ]
    })
        .sort({ purchaseDate: -1 })
        .lean();

    // Get status display helper
    const getStatusBadge = (status: string, deliveryStatus: string) => {
        if (status === 'paid' && deliveryStatus === 'pending') {
            return { class: 'badge-warning', text: 'Processing' };
        }
        if (status === 'paid' && deliveryStatus === 'delivered') {
            return { class: 'badge-success', text: 'Delivered' };
        }
        if (status === 'completed' || deliveryStatus === 'delivered') {
            return { class: 'badge-success', text: 'Completed' };
        }
        if (status === 'failed') {
            return { class: 'badge-danger', text: 'Failed' };
        }
        if (status === 'pending' || status === 'pending_verification') {
            return { class: 'badge-warning', text: 'Pending' };
        }
        return { class: 'badge-warning', text: status };
    };

    return (
        <>
            <Header />
            <main className="container" style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 2vw, 1rem)', minHeight: '70vh' }}>
                <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', marginBottom: '1.5rem' }}>My Orders</h1>

                {/* User Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: 'clamp(0.75rem, 2vw, 1.25rem)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    {session.user.image && (
                        <img
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                border: '2px solid #8b5cf6',
                            }}
                        />
                    )}
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{session.user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{session.user.email}</div>
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
                            No orders yet. Start shopping!
                        </p>
                        <a href="/products" style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            borderRadius: '10px',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}>
                            Browse Products
                        </a>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {orders.map((order: any) => {
                            const statusInfo = getStatusBadge(order.status, order.deliveryStatus || 'pending');
                            const isProcessing = order.status === 'paid' && order.deliveryStatus !== 'delivered';
                            const isDelivered = order.deliveryStatus === 'delivered' || order.status === 'completed';

                            return (
                                <div key={order._id.toString()} style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                                }}>
                                    {/* Order Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        marginBottom: '0.75rem',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                                                {new Date(order.purchaseDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                                                #{order.paymentId?.slice(-8) || order._id.toString().slice(-8)}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            background: statusInfo.class === 'badge-success'
                                                ? 'rgba(16, 185, 129, 0.2)'
                                                : statusInfo.class === 'badge-warning'
                                                    ? 'rgba(245, 158, 11, 0.2)'
                                                    : 'rgba(239, 68, 68, 0.2)',
                                            color: statusInfo.class === 'badge-success'
                                                ? '#10b981'
                                                : statusInfo.class === 'badge-warning'
                                                    ? '#f59e0b'
                                                    : '#ef4444',
                                        }}>
                                            {statusInfo.text}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item: any, idx: number) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.5rem 0',
                                                borderBottom: idx < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.productName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                                        {item.duration} month{item.duration > 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 600, color: '#10b981', fontSize: '0.9rem' }}>
                                                    ₹{item.price}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '0.5rem 0', color: 'rgba(255,255,255,0.5)' }}>
                                            Order items
                                        </div>
                                    )}

                                    {/* Total */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '0.75rem',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                                    }}>
                                        <span style={{ fontWeight: 600 }}>Total</span>
                                        <span style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '1.1rem' }}>
                                            ₹{order.totalAmount || order.items?.reduce((sum: number, i: any) => sum + (i.price || 0), 0) || 0}
                                        </span>
                                    </div>

                                    {/* Processing Message */}
                                    {isProcessing && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            padding: '0.75rem',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                        }}>
                                            <p style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                                ⏳ Your order will be processed in 10-15 minutes
                                            </p>
                                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                                                Credentials will be sent to your email
                                            </p>
                                        </div>
                                    )}

                                    {/* Delivered Message */}
                                    {isDelivered && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            padding: '0.75rem',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                            borderRadius: '8px',
                                        }}>
                                            <p style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>
                                                ✅ Delivered! Check your email for credentials.
                                            </p>
                                            {order.deliveryNote && (
                                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                    {order.deliveryNote}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Support Section */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    textAlign: 'center',
                }}>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>
                        Need help with your order?
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a
                            href="https://t.me/akhilescrow?text=Hi%2C%20I%20need%20help%20with%20my%20OTT4YOU%20order."
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #0088cc, #0077b5)',
                                borderRadius: '8px',
                                color: '#fff',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                            }}
                        >
                            Telegram Support
                        </a>
                        <a
                            href="mailto:batmanisaliveebro@gmail.com?subject=Order%20Help"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #ea4335, #d93025)',
                                borderRadius: '8px',
                                color: '#fff',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                            }}
                        >
                            Email Support
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
