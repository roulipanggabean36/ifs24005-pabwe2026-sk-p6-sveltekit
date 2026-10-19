import { apiRequest } from "../../../helpers/apiHelper";

export type User = {
  id: number;
  name: string;
  email: string;
  photo: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const getUsers = () => apiRequest<{ users: User[] }>("/users");

export const getMe = () => apiRequest<{ user: User }>("/users/me");

export const putMe = (name: string, email: string) =>
  apiRequest("/users/me", { method: "PUT", body: { name, email } });

export const postPhoto = (file: File) => {
  const form = new FormData();
  form.append("photo", file);
  return apiRequest("/users/me/photo", { method: "POST", body: form });
};

export const putPassword = (password: string, newPassword: string) =>
  apiRequest("/users/password", {
    method: "PUT",
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    },
  });
