import { api } from "./api";
import type { User } from "../../store/auth.store";

type AuthResponse = {
  token: string;
  user: User;
};

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  return data as AuthResponse;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post("/auth/register", {
    name,
    email,
    password,
    password_confirmation: password,
  });
  return data as AuthResponse;
}

export async function me() {
  const { data } = await api.get("/auth/me");
  return data as User;
}

export async function logout() {
  await api.post("/auth/logout");
}
