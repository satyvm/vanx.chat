import { apiFetch } from "../utils/fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function login(email: string, password: string) {
  const response: any = await apiFetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // ✅ Store JWT in localStorage (or cookie)
  if (response.access_token) {
    localStorage.setItem("token", response.access_token);
  }

  return response;
}

export async function signup(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const response: any = await apiFetch(`${BASE_URL}/auth/sign-up`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  // Optional: auto-login after signup
  if (response.access_token) {
    localStorage.setItem("token", response.access_token);
  }

  return response;
}
