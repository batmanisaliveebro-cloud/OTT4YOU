'use client';

import { useEffect, useState } from 'react';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updating, setUpdating] = useState<string | null>(null);

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

    const handleUpdateDelivery = async (orderId: string, deliveryStatus: string, deliveryNote?: string) => {
        setUpdating(orderId);
        try {
            const res = await fetch('/api/admin/orders/delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, deliveryStatus, deliveryNote })
            });
            const data = await res.json();
            if (data.success) {
                alert('Order updated successfully!');
                fetchOrders();
            } else {
                alert(data.error || 'Failed to update');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update order');
        } finally {
            setUpdating(null);
        }
    };

    const handleVerify = async (orderId: string, status: 'completed' | 'failed') => {
        if (!confirm(`Mark this order as ${status}?`)) return;

        setUpdating(orderId);
        try {
            const res = await fetch('/api/admin/orders/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status })
            });
            const data = await res.json();
            if (data.success) {
                fetchOrders();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Verification error:', error);
        } finally {
            setUpdating(null);
        }
    };

    // Filter logic - includes 'paid' status
    const filteredOrders = filter === 'all'
        ? orders
        : filter === 'paid'
            ? orders.filter(order => order.status === 'paid')
            : filter === 'delivered'
                ? orders.filter(order => order.deliveryStatus === 'delivered')
                : filter === 'pending'
                    ? orders.filter(order => order.deliveryStatus === 'pending' || !order.deliveryStatus)
                    : orders.filter(order => order.status === filter);

    // Revenue calculations
    const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed');
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const deliveredCount = orders.filter(o => o.deliveryStatus === 'delivered').length;
    const pendingDelivery = orders.filter(o => o.status === 'paid' && o.deliveryStatus !== 'delivered').length;

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Orders Management</h1>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total Orders</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>{orders.length}</div>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Paid Orders</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{paidOrders.length}</div>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Pending Delivery</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{pendingDelivery}</div>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Delivered</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{deliveredCount}</div>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total Revenue</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>₹{totalRevenue.toLocaleString()}</div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {['all', 'paid', 'pending', 'delivered'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: filter === f ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: filter === f ? 600 : 400,
                            fontSize: '0.85rem',
                        }}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="glass-card" style={{ padding: '0.5rem' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <div className="spinner" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No orders found
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredOrders.map((order) => (
                            <div key={order._id} style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '10px',
                                padding: '1rem',
                            }}>
                                {/* Order Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {order.userName || order.userEmail?.split('@')[0] || 'Customer'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
                                            {order.userEmail}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                                            {new Date(order.purchaseDate).toLocaleString('en-IN')} | #{order.paymentId?.slice(-10) || order._id.slice(-8)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                                            ₹{order.totalAmount || 0}
                                        </div>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                            background: order.status === 'paid'
                                                ? 'rgba(16, 185, 129, 0.2)'
                                                : order.status === 'completed'
                                                    ? 'rgba(16, 185, 129, 0.2)'
                                                    : 'rgba(245, 158, 11, 0.2)',
                                            color: order.status === 'paid' || order.status === 'completed' ? '#10b981' : '#f59e0b',
                                        }}>
                                            {order.paymentMethod || 'CASHFREE'} - {order.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Items */}
                                {order.items && order.items.length > 0 && (
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        {order.items.map((item: any, idx: number) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '0.35rem 0',
                                                fontSize: '0.85rem',
                                                color: 'rgba(255,255,255,0.8)',
                                            }}>
                                                <span>{(item.quantity || 1) > 1 ? `${item.quantity}x ` : ''}{item.productName} ({item.duration}M)</span>
                                                <span>₹{item.price * (item.quantity || 1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Delivery Status & Actions */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                }}>
                                    <div>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            background: order.deliveryStatus === 'delivered'
                                                ? 'rgba(16, 185, 129, 0.2)'
                                                : 'rgba(245, 158, 11, 0.2)',
                                            color: order.deliveryStatus === 'delivered' ? '#10b981' : '#f59e0b',
                                        }}>
                                            📦 {order.deliveryStatus === 'delivered' ? 'DELIVERED' : 'PENDING DELIVERY'}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    {order.status === 'paid' && order.deliveryStatus !== 'delivered' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleUpdateDelivery(order._id, 'delivered', 'Credentials sent via email')}
                                                disabled={updating === order._id}
                                                style={{
                                                    padding: '0.4rem 0.75rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                    color: '#fff',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    opacity: updating === order._id ? 0.5 : 1,
                                                }}
                                            >
                                                ✅ Mark Delivered
                                            </button>
                                        </div>
                                    )}

                                    {order.deliveryStatus === 'delivered' && (
                                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>
                                            ✓ Completed
                                        </span>
                                    )}
                                </div>

                                {/* Delivery Note */}
                                {order.deliveryNote && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.5)',
                                        fontStyle: 'italic',
                                    }}>
                                        Note: {order.deliveryNote}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
