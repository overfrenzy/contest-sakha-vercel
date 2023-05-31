import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch";

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];

const callbacks = {
  async signIn({ account }) {
    if (account.provider === "google") {
      try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken: account.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
  
        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;
  
        // Fetch all users from the Yandex Database
        const response = await fetch(
          "https://functions.yandexcloud.net/d4e3ep6u8gc95k9qi64u"
        );
        const responseData = await response.json();
  
        if (response.ok) {
          const users = responseData.users || [];
  
          // Find the specific user based on email
          const foundUser = users.find((u) => u.email === email);
  
          const updatedUser = {
            email,
            name,
            permissions: undefined,
          };
  
          if (
            foundUser &&
            foundUser.permissions &&
            foundUser.permissions.includes("admin")
          ) {
            updatedUser.permissions = "admin";
          } else {
            updatedUser.permissions = "user";
          }
  
          // Update the user object in session
          const token = {
            email,
            name,
            permissions: updatedUser.permissions,
          };
  
          console.log("Generated token:", token);
  
          return token;
        } else {
          console.error("Error fetching user data:", responseData.error);
        }
      } catch (error) {
        console.error("Error verifying id_token:", error);
      }
    }
    return Promise.resolve(false);
  },
  async session({ session, token }) {
    session.user = {
      ...session.user,
      ...token,
    };
  
    return session;
  },
  async signOut({ context }) {
    delete context.req.session.user;
    delete context.req.session.expires;

    return Promise.resolve(context.req.session);
  },
};

const options = {
  providers,
  callbacks,
  session: {
    jwt: true,
    secret: "SESSION_SECRET",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    cookies: {
      session: {
        secure: false,
        name: "contest-cookie",
      },
    },
  },
};

export default options;
