import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'PRODUCTION';

const API_URL = CASHFREE_ENV === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg/orders'
    : 'https://sandbox.cashfree.com/pg/orders';

export async function POST(req: Request) {
    try {
        const session = await auth() as any;
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, items } = await req.json();

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
        }

        // Verify payment with Cashfree
        const response = await fetch(`${API_URL}/${orderId}`, {
            method: 'GET',
            headers: {
                'x-api-version': '2023-08-01',
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY,
            },
        });

        const orderData = await response.json();

        if (!response.ok) {
            console.error('Cashfree verification failed:', orderData);
            return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
        }

        // Check if payment is successful
        if (orderData.order_status !== 'PAID') {
            return NextResponse.json({
                success: false,
                error: `Payment not completed. Status: ${orderData.order_status}`
            }, { status: 400 });
        }

        // Save order to database
        await connectDB();

        const order = new Order({
            userId: session.user.id,
            userEmail: session.user.email,
            userName: session.user.name,
            items: items.map((item: any) => ({
                productId: item.productId,
                productName: item.productName,
                platform: item.platform,
                duration: item.duration,
                price: item.price,
                logo: item.logo,
            })),
            totalAmount: orderData.order_amount,
            paymentMethod: 'CASHFREE',
            paymentId: orderId,
            transactionId: orderData.cf_order_id,
            status: 'paid',
        });

        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            orderId: order._id,
        });

    } catch (error) {
        console.error('Cashfree verify error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
