import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function withAdminAuth(Component) {
  return function WithAdminAuth(props) {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    console.log("session:", session);
    console.log("user permissions:", session?.user?.permissions);

    useEffect(() => {
      if (
        sessionStatus === "authenticated" &&
        (!session?.user || session?.user.permissions !== "admin")
      ) {
        router.push("/unauthorized");
      }
    }, [sessionStatus, session, router]);

    if (sessionStatus === "loading") {
      return <h1>Loading... Please wait.</h1>;
    }

    return <Component {...props} />;
  };
}
