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

        // If admin, return all orders with user info, else return user's orders
        const query = session.user.role === 'admin' ? {} : { userId: session.user.id };

        // For admin, we need to get user emails - orders store userId
        let orders;
        if (session.user.role === 'admin') {
            // Import User model to get email info
            const User = (await import('@/models/User')).default;
            const allOrders = await Order.find(query).sort({ purchaseDate: -1 }).lean();

            // Get all unique user IDs
            const userIds = [...new Set(allOrders.map((o: any) => o.userId))];
            const users = await User.find({ _id: { $in: userIds } }).lean();
            const userMap = new Map(users.map((u: any) => [u._id.toString(), u.email]));

            // Add email to each order
            orders = allOrders.map((order: any) => ({
                ...order,
                userEmail: userMap.get(order.userId?.toString()) || 'Unknown'
            }));
        } else {
            orders = await Order.find(query).sort({ purchaseDate: -1 });
        }

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
