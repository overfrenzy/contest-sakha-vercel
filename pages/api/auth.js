async function callYandexCloudFunction(action, username, password) {
    const response = await fetch("https://functions.yandexcloud.net/d4e3ep6u8gc95k9qi64u", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, username, password }),
    });
  
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Error calling Yandex Cloud Function");
    }
  }
  
  export default async function auth(req, res) {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.status(200).send("");
      return;
    }
  
    const { action, username, password } = req.body;
  
    if (!username || !password) {
      res.status(400).send("Username and password required");
      return;
    }
  
    try {
      const result = await callYandexCloudFunction(action, username, password);
  
      if (action === "register") {
        res.status(200).json({ userId: result.userId });
      } else if (action === "login") {
        if (result.password === password) {
          res.status(200).json({ success: true });
        } else {
          res.status(401).json({ success: false, message: "Invalid username or password" });
        }
      } else {
        res.status(400).send("Invalid action");
      }
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
  