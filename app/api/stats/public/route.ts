import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        // Count users
        const userCount = await User.countDocuments();

        // Aggregate orders
        const orderStats = await Order.aggregate([
            { $match: { status: { $in: ['paid', 'completed'] } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const stats = orderStats[0] || { totalRevenue: 0, totalOrders: 0 };

        return NextResponse.json({
            success: true,
            totalRevenue: stats.totalRevenue,
            totalOrders: stats.totalOrders,
            totalUsers: userCount
        });
    } catch (error) {
        console.error('Public stats error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
    }
}
