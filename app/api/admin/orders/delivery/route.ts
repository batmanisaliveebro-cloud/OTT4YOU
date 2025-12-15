import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req: Request) {
    try {
        const session = await auth() as any;

        // Check if user is admin
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, deliveryStatus, deliveryNote } = await req.json();

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
        }

        if (!deliveryStatus) {
            return NextResponse.json({ success: false, error: 'Delivery status required' }, { status: 400 });
        }

        await connectDB();

        const updateData: any = {
            deliveryStatus,
        };

        if (deliveryNote) {
            updateData.deliveryNote = deliveryNote;
        }

        // If marking as delivered, also update status to completed
        if (deliveryStatus === 'delivered') {
            updateData.status = 'completed';
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set: updateData },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Order updated successfully',
            order: updatedOrder,
        });

    } catch (error: any) {
        console.error('Delivery update error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
