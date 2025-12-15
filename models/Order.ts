import mongoose, { Schema, Model } from 'mongoose';

export interface IOrderItem {
    productId: string;
    productName: string;
    platform: string;
    duration: number;
    price: number;
    logo?: string;
}

export interface IOrder {
    _id: string;
    userId: string;
    userEmail?: string;
    userName?: string;
    items: IOrderItem[];
    totalAmount: number;
    paymentId?: string;
    transactionId?: string;
    paymentMethod: 'CASHFREE' | 'RAZORPAY' | 'MANUAL_UPI';
    status: 'pending' | 'processing' | 'paid' | 'completed' | 'failed' | 'pending_verification';
    deliveryStatus: 'pending' | 'processing' | 'delivered';
    deliveryNote?: string;
    purchaseDate: Date;
}

const OrderItemSchema = new Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    platform: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    logo: { type: String },
});

const OrderSchema = new Schema<IOrder>({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    userEmail: {
        type: String,
    },
    userName: {
        type: String,
    },
    items: [OrderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentId: {
        type: String,
    },
    transactionId: {
        type: String,
    },
    paymentMethod: {
        type: String,
        enum: ['CASHFREE', 'RAZORPAY', 'MANUAL_UPI'],
        default: 'CASHFREE',
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'completed', 'failed', 'pending_verification'],
        default: 'pending',
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'processing', 'delivered'],
        default: 'pending',
    },
    deliveryNote: {
        type: String,
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
});

// Delete the old model if it exists (for hot reload)
if (mongoose.models.Order) {
    delete mongoose.models.Order;
}

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
