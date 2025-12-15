'use client';

import Image from 'next/image';
import { IProduct } from '@/models/Product';
import Link from 'next/link';

interface ProductCardProps {
    product: IProduct;
    onPurchase?: (productId: string, duration: number, price: number) => void;
}

export default function ProductCard({ product }: ProductCardProps) {
    const lowestPrice = Math.min(...product.durations.map(d => d.price));
    const highestMonths = Math.max(...product.durations.map(d => d.months));

    return (
        <div className="product-card" style={{
            background: 'linear-gradient(145deg, rgba(26, 26, 46, 0.95), rgba(15, 15, 30, 0.98))',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Top Section with Logo */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05))',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}>
                    <Image
                        src={product.logo}
                        alt={product.platform}
                        fill
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            </div>

            {/* Content Section */}
            <div style={{
                padding: '1.5rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Platform Badge */}
                <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    color: 'rgba(139, 92, 246, 1)',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    width: 'fit-content',
                }}>
                    {product.platform}
                </div>

                {/* Product Name */}
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: '#fff',
                }}>
                    {product.name}
                </h3>

                {/* Description */}
                <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    flex: 1,
                }}>
                    {product.description.length > 80
                        ? product.description.substring(0, 80) + '...'
                        : product.description}
                </p>

                {/* Pricing Section */}
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    marginBottom: '1rem',
                }}>
                    <span style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        ₹{lowestPrice}
                    </span>
                    <span style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.875rem',
                    }}>
                        /month
                    </span>
                </div>

                {/* Duration Pills */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                    marginBottom: '1.25rem',
                }}>
                    {product.durations.map((d, i) => (
                        <span key={i} style={{
                            padding: '4px 10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}>
                            {d.months}M
                        </span>
                    ))}
                </div>

                {/* View Details Button */}
                <Link
                    href={`/products/${product._id}`}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                    }}
                >
                    View Plans
                </Link>
            </div>
        </div>
    );
}
