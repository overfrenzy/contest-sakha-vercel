import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { OAuth2Client } from "google-auth-library";

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];

const callbacks = {
  async jwt({ token, user, account }) {
    if (account) {
      token.id_token = account.id_token;
    }
    return token;
  },
  async session({ session, token }) {
    session.audience = process.env.GOOGLE_CLIENT_ID;
    session.id_token = token.id_token;
    return session;
  },
  async signIn({ account, token }) {
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

        const user = {
          name,
          email,
        };

        // Fetch all users from the Yandex Database
        const response = await fetch(
          "https://functions.yandexcloud.net/d4e1d50qsjpjf2tk2fkv"
        );
        const responseData = await response.json();

        if (response.ok) {
          const users = responseData.users || []; // Handle empty array

          // Find the specific user based on email
          const foundUser = users.find((u) => u.email === user.email);

          if (
            foundUser &&
            foundUser.permissions &&
            foundUser.permissions.includes("admin")
          ) {
            user.permissions = "admin";
          } else {
            user.permissions = "user";
          }
          // Save the user to the Yandex Cloud Function table using POST
          await fetch(
            "https://functions.yandexcloud.net/d4e1d50qsjpjf2tk2fkv",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(user),
            }
          );

          return true;
        } else {
          console.error("Error fetching user data:", responseData.error);
        }
      } catch (error) {
        console.error("Error verifying id_token:", error);
      }

      return false;
    }
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
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "strict",
        path: "/",
      },
    },
  },
};

export default options;