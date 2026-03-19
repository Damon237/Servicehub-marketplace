import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],

  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account, profile }) {

      if (account) {
        token.accessToken = account.access_token;
      }

      if (profile) {
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
      }

      return token;
    },

    async session({ session, token }) {

      session.accessToken = token.accessToken;

      session.user = {
        name: token.name,
        email: token.email,
        image: token.picture,
      };

      return session;
    },
  },

  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };