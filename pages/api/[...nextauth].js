import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import fetch from "node-fetch";

const options = {
  providers: [
    CredentialsProvider({
      name: "Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { username, password, action } = credentials;

        const response = await fetch("/api/auth/callback/credentials", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, action }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const user = { id: result.userId, name: username };
            return Promise.resolve(user);
          } else {
            throw new Error(result.message);
          }
        } else {
          throw new Error("Error calling the credentials callback");
        }
      },
    }),
  ],
  session: {
    // Session options
  },
  callbacks: {
    signIn: async (user, account, profile) => {
      return Promise.resolve(true);
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
