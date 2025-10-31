// utils/authServer.js
import axios from "axios";

let cachedToken = null;
let lastFetched = null;
const TOKEN_TTL = 1000 * 60 * 10; // 10 mins cache

export async function getServerToken() {
  if (cachedToken && lastFetched && Date.now() - lastFetched < TOKEN_TTL) {
    return cachedToken;
  }

  try {
    const res = await axios.post(
      "https://marketplace.yuukke.com/api/v1/Auth/api_login",
      {
        username: "admin",
        password: "Admin@123",
      },
      { timeout: 30000 }
    );

    if (res.data?.status === "success") {
      cachedToken = res.data.token;
      lastFetched = Date.now();
      return cachedToken;
    }

    throw new Error("Server login failed - invalid response");
  } catch (err) {
    console.error("❌ Server token fetch error:", err.message);
    throw err;
  }
}
