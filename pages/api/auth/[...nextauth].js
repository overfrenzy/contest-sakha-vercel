import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import fetch from "node-fetch";
import { jwtVerify } from "jose";

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
        // console.log("account:", account);
        // console.log("profile:", profile);
        // console.log("account.id_token:", account.id_token);
        try {
          // Fetch public keys from Google's JWKS endpoint
          const jwksResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/certs"
          );
          const jwks = await jwksResponse.json();
          console.log("JWKS Response:", jwks);
          // kid should match on of the keys in the JWKS response

          // Find the key with a matching key ID (kid)
          const key = jwks.keys.find((key) => key.kid === account.id_token.kid);
          //console.log("Key:", key);

          if (!key) {
            console.error("Unable to find key for verification");
            return false;
          }

          const { payload, protectedHeader } = await jwtVerify(
            account.id_token,
            key,
            {
              issuer: profile.iss,
              audience: profile.aud,
            }
          );

          // Access the decoded token data
          const { email, name } = payload;
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

        return true;
      }
    },
    async signOut({ account, session }) {},
  },
};

export default NextAuth(authOptions);
