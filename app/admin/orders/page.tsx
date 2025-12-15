'use client';

import { useEffect, useState } from 'react';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (orderId: string, status: 'completed' | 'failed') => {
        if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;

        try {
            const res = await fetch('/api/admin/orders/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchOrders(); // Refresh list
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Failed to update status');
        }
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order => order.status === filter);

    const totalRevenue = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.amount, 0);

    const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);

    return (
        <div>
            {/* Screenshot Modal */}
            {viewScreenshot && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }} onClick={() => setViewScreenshot(null)}>
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <button
                            onClick={() => setViewScreenshot(null)}
                            style={{
                                position: 'absolute',
                                top: '-2rem',
                                right: '-2rem',
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '2rem',
                                cursor: 'pointer'
                            }}
                        >✕</button>
                        <img
                            src={viewScreenshot}
                            alt="Payment Proof"
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', border: '2px solid white' }}
                        />
                    </div>
                </div>
            )}

            <h1 style={{ marginBottom: '2rem' }}>Orders Management</h1>

            {/* Time-Based Analytics */}
            {(() => {
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);

                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const startOfYear = new Date(now.getFullYear(), 0, 1);

                const completedOrders = orders.filter(o => o.status === 'completed');

                const weeklyOrders = completedOrders.filter(o => new Date(o.purchaseDate) >= startOfWeek);
                const monthlyOrders = completedOrders.filter(o => new Date(o.purchaseDate) >= startOfMonth);
                const yearlyOrders = completedOrders.filter(o => new Date(o.purchaseDate) >= startOfYear);

                const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + o.amount, 0);
                const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.amount, 0);
                const yearlyRevenue = yearlyOrders.reduce((sum, o) => sum + o.amount, 0);

                return (
                    <>
                        {/* Overall Stats */}
                        <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
                            <div className="glass-card">
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Total Orders
                                </p>
                                <h2 style={{ fontSize: '2rem' }} className="text-gradient">
                                    {orders.length}
                                </h2>
                            </div>
                            <div className="glass-card">
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Completed Orders
                                </p>
                                <h2 style={{ fontSize: '2rem' }} className="text-gradient">
                                    {completedOrders.length}
                                </h2>
                            </div>
                            <div className="glass-card">
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Total Revenue
                                </p>
                                <h2 style={{ fontSize: '2rem' }} className="text-gradient">
                                    ₹{totalRevenue.toLocaleString()}
                                </h2>
                            </div>
                        </div>

                        {/* Time-Based Revenue */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                        }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>📊 Revenue Analytics</h3>
                            <div className="grid grid-3" style={{ gap: '1rem' }}>
                                {/* This Week */}
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    textAlign: 'center',
                                }}>
                                    <p style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        📅 This Week
                                    </p>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginBottom: '0.25rem' }}>
                                        ₹{weeklyRevenue.toLocaleString()}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {weeklyOrders.length} orders
                                    </p>
                                </div>

                                {/* This Month */}
                                <div style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    textAlign: 'center',
                                }}>
                                    <p style={{ color: '#3b82f6', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        📆 This Month
                                    </p>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6', marginBottom: '0.25rem' }}>
                                        ₹{monthlyRevenue.toLocaleString()}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {monthlyOrders.length} orders
                                    </p>
                                </div>

                                {/* This Year */}
                                <div style={{
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    textAlign: 'center',
                                }}>
                                    <p style={{ color: '#8b5cf6', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        🗓️ This Year
                                    </p>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.25rem' }}>
                                        ₹{yearlyRevenue.toLocaleString()}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {yearlyOrders.length} orders
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                );
            })()}

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
            }}>
                <button
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('all')}
                    style={{ padding: '0.5rem 1.5rem' }}
                >
                    All Orders
                </button>
                <button
                    className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('completed')}
                    style={{ padding: '0.5rem 1.5rem' }}
                >
                    Completed
                </button>
                <button
                    className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('pending')}
                    style={{ padding: '0.5rem 1.5rem' }}
                >
                    Pending
                </button>
                <button
                    className={`btn ${filter === 'failed' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('failed')}
                    style={{ padding: '0.5rem 1.5rem' }}
                >
                    Failed
                </button>
            </div>

            {/* Orders Table */}
            <div className="glass-card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div className="spinner" />
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 600,
                                    }}>Order ID</th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 600,
                                    }}>User Email</th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 600,
                                    }}>Product</th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 600,
                                    }}>Duration</th>
                                    <th style={{
                                        padding: '1rem',
                                        textAlign: 'left',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 600,
                                    }}>Amount</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Payment Info</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{
                                            padding: '2rem',
                                            textAlign: 'center',
                                            color: 'var(--text-secondary)',
                                        }}>
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order._id} style={{
                                            borderBottom: '1px solid var(--glass-border)',
                                        }}>
                                            <td style={{
                                                padding: '1rem',
                                                fontSize: '0.875rem',
                                                fontFamily: 'monospace',
                                            }}>
                                                {order._id.slice(-8)}
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                fontSize: '0.875rem',
                                                color: '#3b82f6',
                                                maxWidth: '180px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {order.userEmail || 'N/A'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{order.productName}</div>
                                                    <div style={{
                                                        fontSize: '0.875rem',
                                                        color: 'var(--text-secondary)',
                                                    }}>
                                                        {order.platform}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {order.duration} {order.duration === 1 ? 'Month' : 'Months'}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>
                                                ₹{order.amount}
                                            </td>
                                            <td style={{
                                                padding: '1rem',
                                                fontSize: '0.875rem',
                                                color: 'var(--text-secondary)',
                                            }}>
                                                {order.paymentMethod === 'MANUAL_UPI' ? (
                                                    <div>
                                                        <span className="badge badge-warning">Manual</span>
                                                        <div style={{ marginTop: '0.25rem', fontFamily: 'monospace' }}>
                                                            UTR: {order.manualPaymentDetails?.utr}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontFamily: 'monospace' }}>
                                                        {order.paymentId ? order.paymentId.slice(0, 12) + '...' : 'N/A'}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                                {new Date(order.purchaseDate).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge ${order.status === 'completed' ? 'badge-success' :
                                                    order.status === 'pending_verification' ? 'badge-warning' :
                                                        order.status === 'pending' ? 'badge-warning' :
                                                            'badge-danger'
                                                    }`}>
                                                    {order.status === 'pending_verification' ? 'To Verify' : order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {order.status === 'pending_verification' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                                        {order.manualPaymentDetails?.screenshot && (
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => setViewScreenshot(order.manualPaymentDetails.screenshot)}
                                                            >
                                                                View Proof
                                                            </button>
                                                        )}
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                                                onClick={() => handleVerify(order._id, 'completed')}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleVerify(order._id, 'failed')}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
