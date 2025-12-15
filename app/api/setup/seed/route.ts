import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
    try {
        await connectDB();

        const initialProducts = [
            {
                name: "Amazon Prime Video",
                platform: "Prime Video",
                description: "Watch the latest movies, TV shows, and award-winning Amazon Originals.",
                logo: "/logos/prime-video.jpg",
                durations: [
                    { months: 1, price: 49 },
                    { months: 3, price: 129 },
                    { months: 6, price: 239 },
                    { months: 12, price: 399 }
                ],
                features: ["4K UHD Streaming", "Ad-free experience", "Offline Downloads", "Multiple Devices"],
                active: true
            },
            {
                name: "Spotify Premium",
                platform: "Spotify",
                description: "Ad-free music listening, offline playback, and unlimited skips.",
                logo: "/logos/spotify.png",
                durations: [
                    { months: 1, price: 29 },
                    { months: 3, price: 79 },
                    { months: 6, price: 149 },
                    { months: 12, price: 249 }
                ],
                features: ["Ad-free music", "Download songs", "Unlimited skips", "High quality audio"],
                active: true
            },
            {
                name: "YouTube Premium",
                platform: "YouTube Premium",
                description: "YouTube and YouTube Music ad-free, offline, and in the background.",
                logo: "/logos/youtube-premium.jpg",
                durations: [
                    { months: 1, price: 39 },
                    { months: 3, price: 99 },
                    { months: 6, price: 179 },
                    { months: 12, price: 299 }
                ],
                features: ["Ad-free videos", "Background play", "Downloads", "YouTube Music Premium"],
                active: true
            },
            {
                name: "Disney+ Hotstar",
                platform: "JioHotstar",
                description: "Live sports, Hotstar Specials, movies, and more.",
                logo: "/logos/jiohotstar.jpg",
                durations: [
                    { months: 1, price: 59 },
                    { months: 3, price: 149 },
                    { months: 6, price: 279 },
                    { months: 12, price: 499 }
                ],
                features: ["Live Sports", "Hotstar Specials", "4K Quality", "Ad-free entertainment"],
                active: true
            },
            {
                name: "JioSaavn Pro",
                platform: "Jio Saavn",
                description: "Millions of songs, ad-free music, and exclusive content.",
                logo: "/logos/jiosaavn.png",
                durations: [
                    { months: 1, price: 19 },
                    { months: 3, price: 49 },
                    { months: 6, price: 89 },
                    { months: 12, price: 149 }
                ],
                features: ["Ad-free music", "Unlimited Downloads", "High fidelity audio", "Exclusive content"],
                active: true
            },
            {
                name: "SonyLIV Premium",
                platform: "SonyLIV",
                description: "Live sports, originals, and blockbuster movies.",
                logo: "/logos/sonyliv.jpg",
                durations: [
                    { months: 1, price: 59 },
                    { months: 3, price: 149 },
                    { months: 6, price: 269 },
                    { months: 12, price: 449 }
                ],
                features: ["Live TV Channels", "SonyLIV Originals", "Live Sports", "Ad-free"],
                active: true
            }
        ];

        // Upsert logic: Update if exists, Insert if not
        const results = await Promise.all(initialProducts.map(async (product) => {
            return await Product.findOneAndUpdate(
                { platform: product.platform },
                product,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }));

        return NextResponse.json({ success: true, count: results.length, message: "Products seeded successfully" });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: 'Seeding failed' }, { status: 500 });
    }
}
