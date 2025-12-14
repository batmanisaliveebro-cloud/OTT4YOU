import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
    title: 'OTT4YOU - Premium OTT Subscriptions',
    description: 'Get the best deals on Prime Video, Spotify, YouTube Premium, JioHotstar, Jio Saavn, and SonyLIV subscriptions',
    keywords: 'OTT, streaming, subscriptions, Prime Video, Spotify, YouTube Premium, JioHotstar',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
