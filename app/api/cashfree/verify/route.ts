import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'PRODUCTION';

const API_URL = CASHFREE_ENV === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg/orders'
    : 'https://sandbox.cashfree.com/pg/orders';

export async function POST(req: Request) {
    try {
        if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
            return NextResponse.json({ success: false, error: 'Payment config missing' }, { status: 500 });
        }

        const session = await auth() as any;
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
        }

        await connectDB();

        // Check if order exists
        const order = await Order.findOne({ paymentId: orderId });
        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        if (order.status === 'paid' || order.status === 'completed') {
            return NextResponse.json({
                success: true,
                message: 'Order already paid',
                orderId: order._id
            });
        }

        // Verify with Cashfree
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
            return NextResponse.json({
                success: false,
                error: orderData.message || 'Verification failed'
            }, { status: 400 });
        }

        if (orderData.order_status === 'PAID') {
            order.status = 'paid';
            order.transactionId = orderData.cf_order_id?.toString();
            order.deliveryStatus = 'pending'; // Ensure default
            await order.save(); // Save update

            console.log('Order verified and updated to paid:', order._id);

            return NextResponse.json({
                success: true,
                message: 'Payment verified',
                orderId: order._id
            });
        } else {
            return NextResponse.json({
                success: false,
                error: `Payment status: ${orderData.order_status}`
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Verify error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
    }
}
