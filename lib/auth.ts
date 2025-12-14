import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './mongodb';
import User from '@/models/User';

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];

export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            await connectDB();

            // Check if user exists
            let dbUser = await User.findOne({ email: user.email });

            if (!dbUser) {
                // Create new user
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
                    session.user.id = dbUser._id.toString();
                    session.user.role = dbUser.role;
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
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
