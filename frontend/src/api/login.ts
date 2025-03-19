import { apiUrls } from "./apiUrls";

export interface LoginResponse {
  token: string;
  staff: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isHiringManager: boolean;
    isAdmin: boolean;
  };
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(apiUrls.loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to login");
  }

  const data: LoginResponse = await response.json();
  localStorage.setItem("token", data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};
