import { api } from "./api";
import type { User } from "../../store/auth.store";

type AuthResponse = {
  token: string;
  user: User;
};

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
    password_confirmation: password,
  });
  return data;
}

export async function me() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}
