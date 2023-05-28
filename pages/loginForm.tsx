import React, { useState } from "react";
import { useRouter } from "next/router";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Send a request to your Yandex Cloud Function for login
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "login",
        username,
        password,
      }),
    });

    if (response.ok) {
      setNotification("User logged in successfully");
      console.log("User logged in successfully");
      router.push("/"); // Redirect to the main page
    } else {
      setNotification("Invalid username or password");
      console.error("Error logging in");
    }
  };

  return (
    <div>
      {notification && <p>{notification}</p>}
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;
