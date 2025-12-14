import { getServerSession } from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './mongodb';
import User from '@/models/User';

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email: string) => email.trim()) || [];

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            console.log('SignIn callback triggered');
            console.log('User email:', user?.email);

            try {
                if (!user?.email) {
                    console.log('No email found');
                    return false;
                }

                await connectDB();
                console.log('DB connected in signIn');

                let dbUser = await User.findOne({ email: user.email });

                if (!dbUser) {
                    const isAdmin = adminEmails.includes(user.email);
                    dbUser = await User.create({
                        email: user.email,
                        name: user.name || '',
                        image: user.image || '',
                        role: isAdmin ? 'admin' : 'user',
                    });
                    console.log('New user created:', user.email);
                } else {
                    console.log('Existing user found:', user.email);
                }

                return true;
            } catch (error: any) {
                console.error('SignIn callback error:', error.message);
                // Return true anyway to avoid blocking sign-in
                return true;
            }
        },
        async session({ session, token }: any) {
            try {
                if (session?.user?.email) {
                    await connectDB();
                    const dbUser = await User.findOne({ email: session.user.email });

                    if (dbUser) {
                        session.user.id = dbUser._id.toString();
                        session.user.role = dbUser.role;
                    }
                }
            } catch (error: any) {
                console.error('Session callback error:', error.message);
            }
            return session;
        },
        async jwt({ token, user, account }: any) {
            if (user) {
                token.id = user.id;
            }
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    session: {
        strategy: 'jwt' as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // Enable debug mode
};

export const auth = () => getServerSession(authOptions);
