import { getToken } from "./login";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  // Create a new headers object that doesn't override existing headers
  const headers = new Headers(options.headers);

  // Add authorization header
  headers.set("Authorization", `Bearer ${token}`);

  // Only set Content-Type if it's not already set
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    // Handle unauthorized access
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized access");
  }

  return response;
};
