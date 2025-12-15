import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const session = await auth() as any;
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { items, utr, screenshot, amount } = body;

        if (!items || !items.length || !utr || !screenshot) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        // Ensure user exists (should be handled by auth but safety first)
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Check if UTR has already been used
        const existingOrder = await Order.findOne({ 'manualPaymentDetails.utr': utr });
        if (existingOrder) {
            return NextResponse.json({
                success: false,
                error: 'UTR already submitted. This transaction ID has been used before.'
            }, { status: 400 });
        }

        const orders = [];

        // Create an order for each item in the cart
        for (const item of items) {
            const newOrder = new Order({
                userId: user._id,
                productId: item.productId,
                productName: item.productName,
                platform: item.platform,
                duration: item.duration,
                amount: item.price * (item.quantity || 1), // Total amount for this item with quantity
                paymentId: utr, // Use UTR as payment ID for manual payments
                paymentMethod: 'MANUAL_UPI',
                status: 'pending_verification',
                manualPaymentDetails: {
                    utr,
                    screenshot,
                    quantity: item.quantity || 1
                }
            });
            await newOrder.save();
            orders.push(newOrder);
        }

        return NextResponse.json({ success: true, orderCount: orders.length, message: 'Orders submitted for verification' });

    } catch (error) {
        console.error('Manual order creation error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }
}
