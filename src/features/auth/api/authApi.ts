import { apiRequest } from "../../../helpers/apiHelper";
import type { User } from "../../users/api/userApi";

export const postLogin = (email: string, password: string) =>
  apiRequest<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

export const postRegister = (name: string, email: string, password: string) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, password },
    auth: false,
  });

export const postLogout = () => apiRequest("/auth/logout", { method: "POST" });
