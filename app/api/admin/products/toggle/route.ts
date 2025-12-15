import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// Toggle product availability or duration availability
export async function POST(req: Request) {
    try {
        const session = await auth() as any;
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { productId, type, durationMonths, value } = body;

        await connectDB();

        if (type === 'product') {
            // Toggle whole product unavailable
            await Product.findByIdAndUpdate(productId, { unavailable: value });
            return NextResponse.json({ success: true, message: `Product marked as ${value ? 'unavailable' : 'available'}` });
        } else if (type === 'duration') {
            // Toggle specific duration availability
            const product = await Product.findById(productId);
            if (!product) {
                return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
            }

            const durationIndex = product.durations.findIndex((d: any) => d.months === durationMonths);
            if (durationIndex === -1) {
                return NextResponse.json({ success: false, error: 'Duration not found' }, { status: 404 });
            }

            product.durations[durationIndex].available = value;
            await product.save();

            return NextResponse.json({ success: true, message: `${durationMonths} month plan marked as ${value ? 'available' : 'unavailable'}` });
        }

        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Toggle availability error:', error);
        return NextResponse.json({ success: false, error: 'Failed to toggle availability' }, { status: 500 });
    }
}
