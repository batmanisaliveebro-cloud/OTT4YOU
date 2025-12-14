import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await auth() as any;

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { orderId, status } = body;

        if (!orderId || !['completed', 'failed'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid parameters' },
                { status: 400 }
            );
        }

        await connectDB();

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        order.status = status;
        await order.save();

        return NextResponse.json({ success: true, message: `Order marked as ${status}` });

    } catch (error) {
        console.error('Error verifying order:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
