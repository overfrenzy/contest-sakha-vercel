import { getSession } from "next-auth/react";
import { OAuth2Client } from "google-auth-library";

export default async function verifyGoogleToken(req, res) {
  try {
    const session = await getSession({ req });

    if (!session) {
      throw new Error("Session not found");
    }
    /*
    const response = await fetch(
      "https://functions.yandexcloud.net/d4e1d50qsjpjf2tk2fkv"
    );
    const responseData = await response.json();

    if (response.ok) {
      const users = responseData.users || [];

      // Find the specific user based on email
      const foundUser = users.find(
        (user) => user.email === session?.user?.email
      );

      if (!foundUser) {
        throw new Error("User not found");
      }

      if (foundUser.permissions === "admin") {
        console.log("User has admin permissions, proceeding to verify token");
        */
        // @ts-ignore
        const token = session.id_token; 

        const audience = process.env.GOOGLE_CLIENT_ID;

        const client = new OAuth2Client(audience); // Create an OAuth2Client instance with the audience

        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: audience,
        });

        const payload = ticket.getPayload();
        req.user = payload;

        res.status(200).json({ message: "Token verification successful" });
      /*} else {
        console.log(
          "User does not have admin permissions, returning unauthorized error"
        );
        res.status(403).json({ error: "Unauthorized" });
      }
    } else {
      throw new Error("Error fetching user data");
    }*/
  } catch (error) {
    console.error("Error in verifyGoogleToken:", error);
    res.status(401).json({ error: "Invalid Google ID token" });
  }
}
