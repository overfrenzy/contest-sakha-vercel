import NextAuth from "next-auth";
import options from "../../../nextauth.config";

export default (req, res) => NextAuth(req, res, options);
