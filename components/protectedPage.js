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
      try {
        const response = await fetch("/api/verifyGoogleToken");

        if (response.ok) {
          console.log("Token verification successful");
        } else {
          console.log("Token verification failed");
          router.replace("/unauthorized");
        }
      } catch (error) {
        console.log("Failed to verify token:", error);
        router.replace("/");
      }
    };

    if (sessionStatus === "unauthenticated") {
      console.log("User is not authenticated, redirecting to login page");
      router.replace("/profilePage");
    } else if (sessionStatus === "authenticated") {
      checkUserPermissions(); 
    }
  }, [session, sessionStatus, router]);

  if (sessionStatus === "loading") {
    console.log("Checking session, rendering loading state");
    return <div>Loading...</div>;
  }

  return null;
};
