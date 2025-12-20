import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { createCryptoPayment } from '@/lib/nowpayments';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await req.json();
        const { amount, items, currency = 'USD' } = body;

        if (!amount || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data' },
                { status: 400 }
            );
        }

        // Create order in database
        const order = new Order({
            userId: session.user.email,
            userEmail: session.user.email,
            userName: session.user.name,
            items: items,
            totalAmount: amount,
            paymentMethod: 'CRYPTO',
            paymentCurrency: currency,
            status: 'pending',
            deliveryStatus: 'pending',
        });

        await order.save();

        // Create crypto payment with NOWPayments
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const payment = await createCryptoPayment({
            priceAmount: amount,
            priceCurrency: currency,
            orderId: order._id.toString(),
            orderDescription: `OTT4YOU Order - ${items.map((i: any) => i.productName).join(', ')}`,
            ipnCallbackUrl: `${baseUrl}/api/crypto/webhook`,
            successUrl: `${baseUrl}/dashboard?order_id=${order._id}`,
            cancelUrl: `${baseUrl}/checkout`,
        });

        // Update order with crypto payment ID
        order.cryptoTransactionId = payment.paymentId;
        await order.save();

        return NextResponse.json({
            success: true,
            orderId: order._id,
            paymentId: payment.paymentId,
            paymentUrl: payment.paymentUrl,
            payAmount: payment.payAmount,
            payCurrency: payment.payCurrency,
        });
    } catch (error: any) {
        console.error('Crypto payment creation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create crypto payment' },
            { status: 500 }
        );
    }
}
