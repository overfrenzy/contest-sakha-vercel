import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];

const callbacks = {
  async session({ session, token }) {
    // Add the id_token to the session object
    session.id_token = token.id_token;
    return session;
  },
  async signIn({ account, profile, email, credentials }) {
    if (account.provider === "google") {
      // Access the id_token from the credentials object
      const idToken = credentials?.idToken;

      // Insert the id_token into the session
      return Promise.resolve({
        ...account,
        id_token: idToken,
      });
    }

    return Promise.resolve(false);
  },
};

const options = {
  providers,
  callbacks,
  session: {
    jwt: true,
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    cookies: {
      session: {
        secure: false,
        name: process.env.COOKIE_SECRET,
      },
    },
  },
};

export default options;