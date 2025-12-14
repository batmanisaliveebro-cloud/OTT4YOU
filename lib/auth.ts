import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './mongodb';
import User from '@/models/User';

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email: string) => email.trim()) || [];

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
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
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                await connectDB();
                const dbUser = await User.findOne({ email: session.user.email });

                if (dbUser) {
                    (session.user as any).id = dbUser._id.toString();
                    (session.user as any).role = dbUser.role;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    pages: {
        signIn: '/',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);
