import { NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
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

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            productId,
            productName,
            platform,
            duration,
            amount,
        } = await request.json();

        // Verify payment signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Save order to database
        await connectDB();
        const order = await Order.create({
            userId: session.user.id,
            productId,
            productName,
            platform,
            duration,
            amount,
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            status: 'completed',
            purchaseDate: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Payment verified and order created',
            order,
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
