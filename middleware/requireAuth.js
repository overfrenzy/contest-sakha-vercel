import { getSession } from "next-auth/client";

export async function requireAuth(req, res, next) {
  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  next();
}
