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

        // Update existing products with new accurate logos
        const updates = [
            { platform: 'Prime Video', logo: 'https://cdn.simpleicons.org/primevideo/00A8E1' },
            { platform: 'Spotify', logo: 'https://cdn.simpleicons.org/spotify/1DB954' },
            { platform: 'YouTube Premium', logo: 'https://cdn.simpleicons.org/youtube/FF0000' },
            { platform: 'JioHotstar', logo: 'https://cdn.simpleicons.org/hotstar/1F80E0' },
            { platform: 'Jio Saavn', logo: 'https://cdn.simpleicons.org/jiosaavn/2BC5B4' },
            { platform: 'SonyLIV', logo: 'https://cdn.simpleicons.org/sony/E50914' },
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
            message: 'Logos updated with accurate brand icons!',
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
