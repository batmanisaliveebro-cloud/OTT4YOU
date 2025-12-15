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
        // Check env variables
        if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
            console.error('Cashfree credentials not configured');
            return NextResponse.json({
                success: false,
                error: 'Payment system not configured'
            }, { status: 500 });
        }

        const session = await auth() as any;
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, items } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'Items required' }, { status: 400 });
        }

        console.log('Verifying Cashfree order:', orderId);

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
        console.log('Cashfree response:', orderData);

        if (!response.ok) {
            console.error('Cashfree verification failed:', orderData);
            return NextResponse.json({
                success: false,
                error: orderData.message || 'Payment verification failed'
            }, { status: 400 });
        }

        // Check if payment is successful
        if (orderData.order_status !== 'PAID') {
            return NextResponse.json({
                success: false,
                error: `Payment not completed. Status: ${orderData.order_status}`
            }, { status: 400 });
        }

        // Connect to database
        await connectDB();

        // Check if order already exists (prevent duplicate saves)
        const existingOrder = await Order.findOne({ paymentId: orderId });
        if (existingOrder) {
            console.log('Order already exists:', existingOrder._id);
            return NextResponse.json({
                success: true,
                message: 'Order already recorded',
                orderId: existingOrder._id,
            });
        }

        // Calculate total from items
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);

        // Create order in database
        const order = new Order({
            userId: session.user.id || session.user.email,
            userEmail: session.user.email,
            userName: session.user.name,
            items: items.map((item: any) => ({
                productId: item.productId || 'unknown',
                productName: item.productName || 'Product',
                platform: item.platform || item.productName || 'OTT',
                duration: item.duration || 1,
                price: item.price || 0,
                logo: item.logo || '',
            })),
            totalAmount: orderData.order_amount || totalAmount,
            paymentMethod: 'CASHFREE',
            paymentId: orderId,
            transactionId: orderData.cf_order_id?.toString() || '',
            status: 'paid',
            deliveryStatus: 'pending',
        });

        await order.save();
        console.log('Order saved successfully:', order._id);

        return NextResponse.json({
            success: true,
            message: 'Payment verified and order placed successfully',
            orderId: order._id,
        });

    } catch (error: any) {
        console.error('Cashfree verify error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
