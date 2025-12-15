'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [editingPrice, setEditingPrice] = useState<{ productId: string; months: number; price: number } | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleProduct = async (productId: string, currentValue: boolean) => {
        setUpdating(productId);
        try {
            const res = await fetch('/api/admin/products/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, type: 'product', value: !currentValue })
            });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Toggle error:', error);
        } finally {
            setUpdating(null);
        }
    };

    const toggleDuration = async (productId: string, months: number, currentValue: boolean) => {
        setUpdating(`${productId}-${months}`);
        try {
            const res = await fetch('/api/admin/products/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, type: 'duration', durationMonths: months, value: !currentValue })
            });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Toggle error:', error);
        } finally {
            setUpdating(null);
        }
    };

    const updatePrice = async () => {
        if (!editingPrice) return;

        setUpdating(`price-${editingPrice.productId}-${editingPrice.months}`);
        try {
            const res = await fetch('/api/admin/products/price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: editingPrice.productId,
                    durationMonths: editingPrice.months,
                    newPrice: editingPrice.price
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
                setEditingPrice(null);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Price update error:', error);
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: '1rem' }}>Products Management</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Toggle availability, edit prices. Changes reflect immediately.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {products.map((product) => (
                    <div key={product._id} className="glass-card">
                        {/* Product Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid var(--glass-border)',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    position: 'relative',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    background: 'var(--bg-tertiary)',
                                }}>
                                    <Image
                                        src={product.logo}
                                        alt={product.platform}
                                        fill
                                        style={{ objectFit: 'contain', padding: '0.25rem' }}
                                    />
                                </div>
                                <div>
                                    <h3 style={{ marginBottom: '0.25rem' }}>{product.name}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{product.platform}</span>
                                </div>
                            </div>

                            {/* Product Availability Toggle */}
                            <button
                                onClick={() => toggleProduct(product._id, product.unavailable || false)}
                                disabled={updating === product._id}
                                style={{
                                    padding: '0.625rem 1.25rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: updating === product._id ? 'wait' : 'pointer',
                                    background: product.unavailable ? '#ef4444' : '#10b981',
                                    color: '#fff',
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {updating === product._id ? 'Updating...' : product.unavailable ? '❌ Unavailable' : '✅ Available'}
                            </button>
                        </div>

                        {/* Duration Plans with Price Editing */}
                        <div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                Duration Plans (click toggle, double-click to edit price):
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {product.durations.map((duration: any) => {
                                    const isAvailable = duration.available !== false;
                                    const isEditing = editingPrice?.productId === product._id && editingPrice?.months === duration.months;

                                    return (
                                        <div key={duration.months} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {/* Toggle Button */}
                                            <button
                                                onClick={() => toggleDuration(product._id, duration.months, isAvailable)}
                                                disabled={updating === `${product._id}-${duration.months}`}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px 8px 0 0',
                                                    border: isAvailable ? '2px solid #10b981' : '2px solid #ef4444',
                                                    borderBottom: 'none',
                                                    background: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: isAvailable ? '#10b981' : '#ef4444',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    textDecoration: isAvailable ? 'none' : 'line-through',
                                                }}
                                            >
                                                {duration.months}M {isAvailable ? '✅' : '❌'}
                                            </button>

                                            {/* Price Input/Display */}
                                            {isEditing && editingPrice ? (
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <input
                                                        type="number"
                                                        value={editingPrice.price}
                                                        onChange={(e) => setEditingPrice({ productId: editingPrice.productId, months: editingPrice.months, price: parseInt(e.target.value) || 0 })}
                                                        style={{
                                                            width: '80px',
                                                            padding: '0.5rem',
                                                            borderRadius: '0 0 0 8px',
                                                            border: '2px solid #8b5cf6',
                                                            background: 'rgba(139, 92, 246, 0.2)',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            fontSize: '0.9rem',
                                                            outline: 'none',
                                                        }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={updatePrice}
                                                        disabled={updating === `price-${product._id}-${duration.months}`}
                                                        style={{
                                                            padding: '0.5rem',
                                                            borderRadius: '0 0 8px 0',
                                                            border: '2px solid #10b981',
                                                            borderLeft: 'none',
                                                            background: '#10b981',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingPrice(null)}
                                                        style={{
                                                            padding: '0.5rem',
                                                            borderRadius: '0',
                                                            border: '2px solid #ef4444',
                                                            borderLeft: 'none',
                                                            background: '#ef4444',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setEditingPrice({ productId: product._id, months: duration.months, price: duration.price })}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '0 0 8px 8px',
                                                        border: '2px solid rgba(139, 92, 246, 0.3)',
                                                        borderTop: 'none',
                                                        background: 'rgba(139, 92, 246, 0.1)',
                                                        color: '#a78bfa',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        fontSize: '0.95rem',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    title="Click to edit price"
                                                >
                                                    ₹{duration.price}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
