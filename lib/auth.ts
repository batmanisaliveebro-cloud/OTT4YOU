import { getServerSession } from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './mongodb';
import User from '@/models/User';

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email: string) => email.trim()) || [];

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }: any) {
            try {
                if (!user.email) return false;

                await connectDB();

                let dbUser = await User.findOne({ email: user.email });

                if (!dbUser) {
                    const isAdmin = adminEmails.includes(user.email);
                    dbUser = await User.create({
                        email: user.email,
                        name: user.name || '',
                        image: user.image || '',
                        role: isAdmin ? 'admin' : 'user',
                    });
                }

                return true;
            } catch (error) {
                console.error('SignIn callback error:', error);
                return true; // Still allow sign in even if DB fails
            }
        },
        async session({ session, token }: any) {
            try {
                if (session.user && token.sub) {
                    await connectDB();
                    const dbUser = await User.findOne({ email: session.user.email });

                    if (dbUser) {
                        session.user.id = dbUser._id.toString();
                        session.user.role = dbUser.role;
                    }
                }
            } catch (error) {
                console.error('Session callback error:', error);
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
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
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};

export const auth = () => getServerSession(authOptions);
