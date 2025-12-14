export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();
        const products = await Product.find({ active: true }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth() as any;

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const data = await request.json();

        const product = await Product.create(data);

        return NextResponse.json({ success: true, product }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
