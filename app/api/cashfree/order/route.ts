import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import crypto from 'crypto';

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

        const { amount, items } = await req.json();

        if (!amount || amount < 1 || !items || items.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 });
        }

        await connectDB();

        // Generate unique order ID
        const orderId = `OTT_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        // Create Order in DB first (Pending)
        const newOrder = new Order({
            userId: session.user.id || session.user.email,
            userEmail: session.user.email,
            userName: session.user.name,
            items: items.map((item: any) => ({
                productId: item.productId || 'unknown',
                productName: item.productName || 'Product',
                platform: item.platform || item.productName || 'OTT',
                duration: item.duration || 1,
                price: item.price || 0,
                quantity: item.quantity || 1,
                logo: item.logo || '',
            })),
            totalAmount: amount,
            paymentMethod: 'CASHFREE',
            paymentId: orderId, // We use this as the link
            transactionId: '',
            status: 'pending',
            deliveryStatus: 'pending',
        });

        await newOrder.save();
        console.log('Created pending order:', newOrder._id, 'PaymentId:', orderId);

        // Create order in Cashfree
        const orderData = {
            order_id: orderId,
            order_amount: amount,
            order_currency: 'INR',
            customer_details: {
                customer_id: session.user.id || session.user.email?.replace(/[^a-zA-Z0-9]/g, '_'),
                customer_name: session.user.name || 'Customer',
                customer_email: session.user.email,
                customer_phone: '9999999999',
            },
            order_meta: {
                return_url: `${process.env.NEXTAUTH_URL}/dashboard?order_id={order_id}`,
                notify_url: `${process.env.NEXTAUTH_URL}/api/cashfree/webhook`,
            },
            order_note: `OTT4YOU Order - ${items.length} item(s)`,
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY,
            },
            body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cashfree order creation failed:', data);
            // Optionally delete the pending order or leave it as failed
            await Order.findByIdAndDelete(newOrder._id);
            return NextResponse.json({
                success: false,
                error: data.message || 'Failed to create payment session'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            orderId: data.order_id,
            paymentSessionId: data.payment_session_id,
        });

    } catch (error: any) {
        console.error('Cashfree order error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
