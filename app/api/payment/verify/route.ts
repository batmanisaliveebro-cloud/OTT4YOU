export const dynamic = 'force-dynamic';

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
            isCart,
            items
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

        await connectDB();
        let orders = [];

        if (isCart && items && Array.isArray(items)) {
            // Create multiple orders for cart items
            for (const item of items) {
                // If quantity > 1, create multiple records or just one?
                // For subscriptions, it's safer to create one record per unit to track them individually (or user can gift)
                // But typically user buys once. We'll create one record per quantity unit for now.
                for (let i = 0; i < item.quantity; i++) {
                    const order = await Order.create({
                        userId: session.user.id,
                        productId: item.productId,
                        productName: item.productName || item.platform, // Fallback
                        platform: item.platform,
                        duration: item.duration,
                        amount: item.price, // Individual item price
                        paymentId: razorpay_payment_id,
                        razorpayOrderId: razorpay_order_id,
                        status: 'completed',
                        purchaseDate: new Date(),
                    });
                    orders.push(order);
                }
            }
        } else {
            // Single purchase
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
            orders.push(order);
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and orders created',
            orders,
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
