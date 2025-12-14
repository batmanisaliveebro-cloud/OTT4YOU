export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth() as any;

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // If admin, return all orders, else return user's orders
        const query = session.user.role === 'admin' ? {} : { userId: session.user.id };
        const orders = await Order.find(query).sort({ purchaseDate: -1 });

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
