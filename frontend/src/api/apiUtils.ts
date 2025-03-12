import { getToken } from "../api/login";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

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
