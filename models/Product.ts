import mongoose, { Schema, Model } from 'mongoose';

export interface IDuration {
    months: number;
    price: number; // INR price
    priceUSD?: number; // USD price (optional, calculated if not set)
    available: boolean; // Toggle for per-duration availability
}

export interface IProduct {
    _id: string;
    name: string;
    platform: string;
    description: string;
    logo: string;
    durations: IDuration[];
    features: string[];
    active: boolean;
    unavailable: boolean; // Toggle for whole product unavailable
    createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        required: true,
        enum: ['Prime Video', 'Spotify', 'YouTube Premium', 'JioHotstar', 'Jio Saavn', 'SonyLIV'],
    },
    description: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        required: true,
    },
    durations: [{
        months: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        priceUSD: {
            type: Number,
            required: false, // Optional, will be calculated from INR if not set
        },
        available: {
            type: Boolean,
            default: true,
        },
    }],
    features: [String],
    active: {
        type: Boolean,
        default: true,
    },
    unavailable: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
