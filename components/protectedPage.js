import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useProtectedPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("Session:", session);
    console.log("Session status:", sessionStatus);

    const checkUserPermissions = async () => {
      // Fetch user data from the database
      const response = await fetch("https://functions.yandexcloud.net/d4e3ep6u8gc95k9qi64u");
      const responseData = await response.json();

      if (response.ok) {
        const users = responseData.users || [];

        // Find the specific user based on email
        const foundUser = users.find((user) => user.email === session?.user?.email);

        if (foundUser && foundUser.permissions === "admin") {
          console.log("User has admin permissions, rendering protected content");
        } else {
          console.log("User does not have admin permissions, redirecting to unauthorized page");
          router.replace("/unauthorized");
        }
      } else {
        console.log("Failed to fetch user data from the database");
        // Handle the error or redirect to an error page
      }
    };

    if (sessionStatus === "unauthenticated") {
      console.log("User is not authenticated, redirecting to login page");
      router.replace("/profilePage");
    } else if (sessionStatus === "authenticated") {
      /*
      // Verify the Google ID token
      const verifyToken = async () => {
        try {
          const response = await fetch("/api/verifyGoogleToken"); // Path to your middleware endpoint
          const data = await response.json();

          if (response.ok) {
            console.log("Token verification successful");
            checkUserPermissions(); // Proceed to check user permissions
          } else {
            console.log("Token verification failed");
            router.replace("/unauthorized"); // Redirect to unauthorized page
          }
        } catch (error) {
          console.log("Failed to verify token:", error);
          // Handle the error or redirect to an error page
        }
      };
      verifyToken();
      */
    }
  }, [session, sessionStatus, router]);

  if (sessionStatus === "loading") {
    console.log("Checking session, rendering loading state");
    return <div>Loading...</div>;
  }

  return null;
};
