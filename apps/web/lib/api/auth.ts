import { apiFetch } from "../utils/fetcher";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${BASE_URL}/auth/sign-up`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout() {
  return apiFetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
  });
}

export async function refresh(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${BASE_URL}/auth/refresh`, {
    method: "POST",
  });
}
