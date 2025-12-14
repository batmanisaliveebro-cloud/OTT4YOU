export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    return NextResponse.json({
        clientId: {
            length: clientId.length,
            starts: clientId.substring(0, 15) + '...',
            ends: '...' + clientId.substring(clientId.length - 10),
            containsSpaces: clientId.includes(' '),
            containsNewlines: clientId.includes('\n'),
        },
        clientSecret: {
            length: clientSecret.length,
            starts: clientSecret.substring(0, 5) + '...',
            containsSpaces: clientSecret.includes(' '),
            containsNewlines: clientSecret.includes('\n'),
        },
        nextAuthUrl: process.env.NEXTAUTH_URL,
        expectedCallbackUrl: process.env.NEXTAUTH_URL + '/api/auth/callback/google',
    });
}
