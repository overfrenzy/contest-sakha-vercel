import React, { useState } from "react";
import { useRouter } from "next/router";

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Send a request to your Yandex Cloud Function for registration
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "register",
        username,
        password,
      }),
    });

    if (response.ok) {
      setNotification("User registered successfully");
      console.log("User registered successfully");
      router.push("/"); // Redirect to the main page
    } else {
      setNotification("Error registering user");
      console.error("Error registering user");
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterForm;
