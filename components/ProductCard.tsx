'use client';

import Image from 'next/image';
import { IProduct } from '@/models/Product';
import Link from 'next/link';

interface ProductCardProps {
    product: IProduct;
    onPurchase?: (productId: string, duration: number, price: number) => void;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="glass-card" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
            position: 'relative',
        }}>
            <div style={{
                width: '100px',
                height: '100px',
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-tertiary)',
                padding: '0.5rem',
                marginBottom: '1rem',
            }}>
                <Image
                    src={product.logo}
                    alt={product.platform}
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                {product.name}
            </h3>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Starting at ₹{product.durations[0]?.price}
            </p>

            <Link
                href={`/products/${product._id}`}
                className="btn btn-primary"
                style={{ width: '100%' }}
            >
                View Details
            </Link>
        </div>
    );
}
