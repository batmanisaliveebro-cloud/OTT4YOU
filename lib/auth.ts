import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';
import connectDB from './mongodb';
import User from '@/models/User';

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email: string) => email.trim()) || [];

const config = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }: any) {
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
        async session({ session, token }: any) {
            if (session.user && token.sub) {
                await connectDB();
                const dbUser = await User.findOne({ email: session.user.email });

                if (dbUser) {
                    session.user.id = dbUser._id.toString();
                    session.user.role = dbUser.role;
                }
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
    },
    session: {
        strategy: 'jwt' as const,
    },
} satisfies NextAuthConfig;

const { handlers, auth, signIn, signOut } = NextAuth(config);

export { handlers, auth, signIn, signOut };
