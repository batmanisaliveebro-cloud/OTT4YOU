import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyIPNSignature } from '@/lib/nowpayments';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const signature = req.headers.get('x-nowpayments-sig');
        const body = await req.text();

        // Verify signature
        if (!signature || !verifyIPNSignature(signature, body)) {
            console.error('Invalid NOWPayments IPN signature');
            return NextResponse.json(
                { success: false, error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const data = JSON.parse(body);

        console.log('NOWPayments IPN received:', data);

        const {
            payment_id,
            order_id,
            payment_status,
            pay_amount,
            pay_currency,
            actually_paid,
        } = data;

        // Find order
        const order = await Order.findById(order_id);
        if (!order) {
            console.error('Order not found:', order_id);
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Update order based on payment status
        switch (payment_status) {
            case 'finished':
            case 'confirmed':
                order.status = 'paid';
                order.cryptoCurrency = pay_currency;
                order.cryptoAmount = actually_paid || pay_amount;
                break;

            case 'partially_paid':
                order.status = 'processing';
                order.cryptoCurrency = pay_currency;
                order.cryptoAmount = actually_paid || pay_amount;
                break;

            case 'failed':
            case 'expired':
            case 'refunded':
                order.status = 'failed';
                break;

            default:
                // Keep as pending for other statuses
                break;
        }

        await order.save();

        console.log(`Order ${order_id} updated with crypto payment status: ${payment_status}`);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Crypto webhook error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
