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

        // Just update existing products with new logos instead of delete/insert
        const updates = [
            { platform: 'Prime Video', logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/amazon-prime-video.png' },
            { platform: 'Spotify', logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/spotify.png' },
            { platform: 'YouTube Premium', logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/youtube.png' },
            { platform: 'JioHotstar', logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/disney-plus.png' },
            { platform: 'Jio Saavn', logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/navidrome.png' },
            { platform: 'SonyLIV', logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/emby.png' },
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
            message: 'Logos updated!',
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
