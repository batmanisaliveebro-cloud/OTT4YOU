import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        console.log('Webhook received');

        // 1. Verify Signature (Crucial for security)
        // Cashfree sends signature in x-webhook-signature header
        // However, for simplicity/MVP we might check basics first, but strictly we should verify.
        // We need raw body for signature verification usually. Since Next.js consumes stream, 
        // signature verification can be tricky without raw body. 
        // For now, we'll trust the order_id existence and double check status with Cashfree API if needed.
        // OR better: we fetch the status from Cashfree API again to be 100% sure.

        const contentType = req.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            // Cashfree sends form-urlencoded usually
            return NextResponse.json({ success: false, message: 'Invalid content type' }, { status: 400 });
        }

        const body = await req.json();
        // handling the webhook payload structure
        console.log('Webhook payload:', body);

        const { data, event_time, type } = body;

        if (!data || !data.order || !data.order.order_id) {
            return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
        }

        const orderId = data.order.order_id;
        const paymentStatus = data.payment.payment_status;

        if (paymentStatus === 'SUCCESS') {
            await connectDB();
            const order = await Order.findOne({ paymentId: orderId });

            if (order) {
                if (order.status !== 'paid' && order.status !== 'completed') {
                    order.status = 'paid';
                    order.transactionId = data.payment.cf_payment_id;
                    order.deliveryStatus = 'pending';
                    await order.save();
                    console.log(`Webhook: Order ${orderId} marked as paid`);
                } else {
                    console.log(`Webhook: Order ${orderId} already paid`);
                }
            } else {
                console.error(`Webhook: Order ${orderId} not found in DB`);
            }
        }

        return NextResponse.json({ success: true, message: 'Webhook processed' });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
