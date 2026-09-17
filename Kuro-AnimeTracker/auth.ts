import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { getUserByIdentity, createUser, getUserById } from '@/lib/userStore';
import { verifyPassword } from '@/lib/userStore';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Email & Password',
      credentials: {
        identity: { label: 'Email or Handle', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identity || !credentials?.password) return null;

        const user = await getUserByIdentity(credentials.identity as string);
        if (!user) return null;

        const isMatch = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        );
        if (!isMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-ins, auto-create or find the user in our local store
      if (account?.provider === 'google' && user.email) {
        const existing = await getUserByIdentity(user.email);
        if (!existing) {
          // First-time Google sign-in: create a local account
          try {
            const handle = user.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase();
            await createUser({
              handle,
              email: user.email,
              password: `google_oauth_${Date.now()}`, // placeholder, not used for google logins
              name: user.name || handle,
              avatar: user.image || undefined,
            });
          } catch (e) {
            // Handle already taken — acceptable, user exists
            console.warn('Google auto-create note:', e);
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // On initial sign in, fetch the local user data and store it in the JWT token
      if (user?.email) {
        const localUser = await getUserByIdentity(user.email);
        if (localUser) {
          token.id = localUser.id;
          token.handle = localUser.handle;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Read from the JWT token instead of querying the DB on every session check
      // This is crucial for supporting 500+ concurrent users on a free database!
      if (session.user && token.id) {
        (session.user as any).id = token.id;
        (session.user as any).handle = token.handle;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
});
