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

        let orders;

        if (session.user.role === 'admin') {
            // Admin gets all orders
            orders = await Order.find({}).sort({ purchaseDate: -1 }).lean();
        } else {
            // Regular user gets their orders (by userId, userEmail, or session ID)
            orders = await Order.find({
                $or: [
                    { userId: session.user.id },
                    { userId: session.user.email },
                    { userEmail: session.user.email }
                ]
            }).sort({ purchaseDate: -1 }).lean();
        }

        return NextResponse.json({ success: true, orders });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
