'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IProduct } from '@/models/Product';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDuration, setSelectedDuration] = useState<number>(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            if (data.success) {
                const found = data.products.find((p: IProduct) => p._id === params.id);
                setProduct(found || null);
                if (found && found.durations.length > 0) {
                    setSelectedDuration(0);
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product || !product.durations[selectedDuration]) return;

        const duration = product.durations[selectedDuration];
        addToCart({
            productId: product._id,
            productName: product.name,
            platform: product.platform,
            logo: product.logo,
            duration: duration.months,
            price: duration.price,
        }, quantity);

        alert(`Added ${quantity}x ${product.platform} (${duration.months}M) to cart!`);
    };

    const handleBuyNow = () => {
        if (!product || !product.durations[selectedDuration]) return;

        const duration = product.durations[selectedDuration];
        addToCart({
            productId: product._id,
            productName: product.name,
            platform: product.platform,
            logo: product.logo,
            duration: duration.months,
            price: duration.price,
        }, quantity);

        router.push('/checkout');
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading product...</p>
                </main>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header />
                <main className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <h1>Product Not Found</h1>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        The product you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => router.push('/products')}
                        className="btn btn-primary"
                        style={{ marginTop: '2rem' }}
                    >
                        Back to Products
                    </button>
                </main>
                <Footer />
            </>
        );
    }

    const selectedPlan = product.durations[selectedDuration];
    const stockStatus = product.stock > 50 ? 'high' : product.stock > 10 ? 'medium' : 'low';
    const stockColor = stockStatus === 'high' ? '#10b981' : stockStatus === 'medium' ? '#f59e0b' : '#ef4444';

    return (
        <>
            <Header />
            <main className="container" style={{ padding: '4rem 2rem', maxWidth: '1200px' }}>
                {/* Breadcrumb */}
                <div style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <a href="/products" style={{ color: 'var(--primary-start)' }}>Products</a>
                    <span style={{ margin: '0 0.5rem' }}>/</span>
                    <span>{product.platform}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    {/* Left Side - Image */}
                    <div>
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <img
                                src={product.logo}
                                alt={product.platform}
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    maxHeight: '400px',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Side - Details */}
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.name}</h1>
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            {product.description}
                        </p>

                        {/* Stock Badge */}
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            background: `${stockColor}15`,
                            color: stockColor,
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            marginBottom: '2rem'
                        }}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </div>

                        {/* Duration Selection */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Select Plan Duration</h3>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {product.durations.map((duration, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDuration(index)}
                                        className="filter-chip"
                                        style={{
                                            padding: '1rem 1.5rem',
                                            background: selectedDuration === index ? '#8b5cf6' : '#f3f4f6',
                                            color: selectedDuration === index ? 'white' : '#374151',
                                            border: '1px solid' + (selectedDuration === index ? ' #8b5cf6' : ' #d1d5db'),
                                        }}
                                    >
                                        <div style={{ fontWeight: 600 }}>{duration.months} Month{duration.months > 1 ? 's' : ''}</div>
                                        <div style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>₹{duration.price}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selection */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Quantity</h3>
                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="input"
                                style={{ width: '150px', padding: '0.75rem' }}
                            >
                                {[1, 2, 3, 4, 5].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Summary */}
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Price per item:</span>
                                <span style={{ fontWeight: 600 }}>₹{selectedPlan.price}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Quantity:</span>
                                <span style={{ fontWeight: 600 }}>{quantity}</span>
                            </div>
                            <div style={{
                                borderTop: '1px solid var(--glass-border)',
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '1.25rem',
                                fontWeight: 700
                            }}>
                                <span>Total:</span>
                                <span style={{ color: 'var(--primary-start)' }}>₹{selectedPlan.price * quantity}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock < 1}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '1rem' }}
                            >
                                Buy Now
                            </button>
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock < 1}
                                className="btn"
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: 'white',
                                    border: '1px solid #d1d5db'
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
