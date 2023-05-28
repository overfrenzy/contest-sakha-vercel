import NextAuth from "next-auth";
import yandexCloudProvider from "./pages/api/auth/yandexcloud-provider";

const options = {
  providers: [
    // Add your custom provider
    yandexCloudProvider,
  ],
  session: {
    // Configure your session options
  },
};

export default (req, res) => NextAuth(req, res, options);