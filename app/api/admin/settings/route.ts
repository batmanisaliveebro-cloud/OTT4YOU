export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();
        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create({
                maintenanceMode: false,
                maintenanceMessage: 'We are currently performing maintenance. Please check back soon!',
            });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth() as any;

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const data = await request.json();

        let settings = await Settings.findOne();

        if (!settings) {
            settings = await Settings.create(data);
        } else {
            Object.assign(settings, data);
            await settings.save();
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
