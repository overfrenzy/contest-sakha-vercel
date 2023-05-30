import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        console.log("account:", account);
        console.log("profile:", profile);
        // console.log("account.id_token:", account.id_token);
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
            email,
            name,
          };

          // Fetch all users from the Yandex Database
          const response = await fetch(
            "https://functions.yandexcloud.net/d4e3ep6u8gc95k9qi64u"
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
              "https://functions.yandexcloud.net/d4e3ep6u8gc95k9qi64u",
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
    async signOut({ account, session }) {},
  },
};

export default NextAuth(authOptions);
