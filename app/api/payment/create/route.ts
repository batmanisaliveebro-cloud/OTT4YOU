import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await auth() as any;

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { amount, productId, productName, duration } = await request.json();

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                productId,
                productName,
                duration,
                userId: session.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Error creating payment order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
