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
  async session({ session, token }) {
    // Add the id_token and audience to the session object
    session.id_token = token.id_token;
    session.audience = process.env.GOOGLE_CLIENT_ID; // Set the audience value
    return session;
  },
  async signIn({ account, profile }) {
    if (account.provider === "google") {
      //console.log("account:", account);
      //console.log("profile:", profile);
      //console.log("account.id_token:", account.id_token);
      try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken: account.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;
        const id_token = account.id_token;

        const user = {
          id_token,
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
          console.log("start sending POST");
          // Save the user to the Yandex Cloud Function table using POST
          await fetch(
            "https://functions.yandexcloud.net/d4e3ep6u8gc95k9qi64u",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(user),
            }
          );
          const body = JSON.stringify(user);
          console.log("successfully sent POST:", body);

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
        secure: false,
        name: process.env.COOKIE_SECRET,
      },
    },
  },
};

export default options;