// NOWPayments API integration for crypto payments

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || '';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';

export interface CreateCryptoPaymentParams {
    priceAmount: number;
    priceCurrency: 'USD' | 'INR';
    orderId: string;
    orderDescription: string;
    ipnCallbackUrl: string;
    successUrl: string;
    cancelUrl: string;
}

export interface CryptoPaymentResponse {
    paymentId: string;
    paymentUrl: string;
    payAmount: number;
    payCurrency: string;
    priceAmount: number;
    priceCurrency: string;
    orderId: string;
}

/**
 * Create a crypto payment with NOWPayments
 */
export async function createCryptoPayment(
    params: CreateCryptoPaymentParams
): Promise<CryptoPaymentResponse> {
    try {
        const response = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_amount: params.priceAmount,
                price_currency: params.priceCurrency,
                order_id: params.orderId,
                order_description: params.orderDescription,
                ipn_callback_url: params.ipnCallbackUrl,
                success_url: params.successUrl,
                cancel_url: params.cancelUrl,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create crypto payment');
        }

        const data = await response.json();

        return {
            paymentId: data.id,
            paymentUrl: data.invoice_url,
            payAmount: data.pay_amount,
            payCurrency: data.pay_currency,
            priceAmount: data.price_amount,
            priceCurrency: data.price_currency,
            orderId: data.order_id,
        };
    } catch (error) {
        console.error('NOWPayments API Error:', error);
        throw error;
    }
}

/**
 * Verify NOWPayments IPN callback signature
 */
export function verifyIPNSignature(
    receivedSignature: string,
    payload: string
): boolean {
    if (!NOWPAYMENTS_IPN_SECRET) {
        console.warn('NOWPAYMENTS_IPN_SECRET not configured');
        return false;
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');

    return receivedSignature === calculatedSignature;
}

/**
 * Get payment status from NOWPayments
 */
export async function getCryptoPaymentStatus(paymentId: string) {
    try {
        const response = await fetch(
            `${NOWPAYMENTS_API_URL}/payment/${paymentId}`,
            {
                headers: {
                    'x-api-key': NOWPAYMENTS_API_KEY,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get payment status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching payment status:', error);
        throw error;
    }
}
