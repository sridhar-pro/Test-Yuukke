// utils/fetchWithAuth.js
export const fetchWithAuthGlobal = async (
  url,
  options = {},
  getValidToken,
  retry = false
) => {
  // Wait helper
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  // Token retry
  const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      const token = await getValidToken();
      if (token && typeof token === "string" && token.length > 10) return token;

      if (attempt === 5) localStorage.removeItem("authToken");
      await wait(delay);
      attempt++;
    }
    throw new Error("Auth token unavailable after multiple retries.");
  };

  const token = await getTokenWithRetry();

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401 && !retry) {
    localStorage.removeItem("authToken");
    return fetchWithAuthGlobal(url, options, getValidToken, true);
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  return res.json();
};
