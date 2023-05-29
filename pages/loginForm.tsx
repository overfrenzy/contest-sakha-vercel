import { getCsrfToken } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function LoginForm({ csrfToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          action: "signIn",
        }),
      });

      if (response.ok) {
        // Redirect to the main page
        router.push("/");
      } else {
        // Handle login error
        console.error("Login failed");
      }
    } catch (error) {
      // Handle network or server error
      console.error("An error occurred:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      <label>
        Username:
        <input
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label>
        Password:
        <input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Sign in</button>
    </form>
  );
}

export async function getServerSideProps(context) {
  const csrfToken = await getCsrfToken(context);

  if (!csrfToken) {
    return {
      redirect: {
        destination: "/error",
        permanent: false,
      },
    };
  }

  return {
    props: {
      csrfToken,
    },
  };
}
