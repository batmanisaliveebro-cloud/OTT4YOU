import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// Update duration price
export async function POST(req: Request) {
    try {
        const session = await auth() as any;
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, durationMonths, newPrice } = await req.json();

        if (!productId || !durationMonths || newPrice === undefined) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        if (newPrice < 0) {
            return NextResponse.json({ success: false, error: 'Price cannot be negative' }, { status: 400 });
        }

        await connectDB();

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const durationIndex = product.durations.findIndex((d: any) => d.months === durationMonths);
        if (durationIndex === -1) {
            return NextResponse.json({ success: false, error: 'Duration not found' }, { status: 404 });
        }

        product.durations[durationIndex].price = newPrice;
        await product.save();

        return NextResponse.json({
            success: true,
            message: `Price updated to ₹${newPrice} for ${durationMonths} month plan`
        });
    } catch (error) {
        console.error('Update price error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update price' }, { status: 500 });
    }
}
