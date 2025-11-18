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

export interface SignupResponse {
  success: boolean;
  email: string;
  message: string;
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
}): Promise<SignupResponse> {
  return apiFetch<SignupResponse>(`${BASE_URL}/auth/sign-up`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyEmailCode(email: string, code: string) {
  return apiFetch<AuthResponse>(`${BASE_URL}/auth/email/verify`, {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function logout() {
  return apiFetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    skipAuthRetry: true,
  });
}

export async function refresh(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    skipAuthRetry: true,
  });
}

export async function requestPasswordReset(email: string) {
  return apiFetch(`${BASE_URL}/auth/password/reset/request`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  password: string,
) {
  return apiFetch(`${BASE_URL}/auth/password/reset/confirm`, {
    method: "POST",
    body: JSON.stringify({ email, code, password }),
  });
}
