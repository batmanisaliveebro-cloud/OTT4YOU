export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
    const logs: string[] = [];

    try {
        logs.push('1. Starting...');

        await connectDB();
        logs.push('2. DB connected');

        // Update existing products with local logo paths
        const updates = [
            { platform: 'Prime Video', logo: '/logos/prime-video.jpg' },
            { platform: 'Spotify', logo: '/logos/spotify.png' },
            { platform: 'YouTube Premium', logo: '/logos/youtube-premium.jpg' },
            { platform: 'JioHotstar', logo: '/logos/jiohotstar.jpg' },
            { platform: 'Jio Saavn', logo: '/logos/jiosaavn.png' },
            { platform: 'SonyLIV', logo: '/logos/sonyliv.jpg' },
        ];

        logs.push('3. Updating logos...');

        for (const update of updates) {
            await Product.updateOne(
                { platform: update.platform },
                { $set: { logo: update.logo } }
            );
        }

        logs.push('4. Done!');

        return NextResponse.json({
            success: true,
            message: 'Logos updated with local images!',
            logs,
        });
    } catch (error: any) {
        logs.push(`ERROR: ${error.message || String(error)}`);
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error',
            logs,
        });
    }
}
