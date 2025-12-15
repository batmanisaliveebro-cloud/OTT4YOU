import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

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

        const { amount, items } = await req.json();

        if (!amount || amount < 1) {
            return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
        }

        // Generate unique order ID
        const orderId = `OTT_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        // Create order in Cashfree
        const orderData = {
            order_id: orderId,
            order_amount: amount,
            order_currency: 'INR',
            customer_details: {
                customer_id: session.user.id || session.user.email?.replace(/[^a-zA-Z0-9]/g, '_'),
                customer_name: session.user.name || 'Customer',
                customer_email: session.user.email,
                customer_phone: '9999999999', // Default phone, can be updated
            },
            order_meta: {
                return_url: `${process.env.NEXTAUTH_URL}/dashboard?order_id={order_id}`,
                notify_url: `${process.env.NEXTAUTH_URL}/api/cashfree/webhook`,
            },
            order_note: `OTT4YOU Order - ${items?.length || 1} item(s)`,
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
            return NextResponse.json({
                success: false,
                error: data.message || 'Failed to create order'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            orderId: data.order_id,
            paymentSessionId: data.payment_session_id,
            orderAmount: data.order_amount,
        });

    } catch (error) {
        console.error('Cashfree order error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
