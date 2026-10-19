import { writable } from "svelte/store";
import { runMutation, showErrorDialog } from "../../../helpers/toolsHelper";
import { asyncPreloadProfile } from "../../auth/states/authStore";
import { getUsers, postPhoto, putMe, putPassword, type User } from "../api/userApi";

export const users = writable<User[]>([]);
export const isUsersLoading = writable(false);
export const isMutatingProfile = writable(false);
export const isMutatingPhoto = writable(false);
export const isMutatingPassword = writable(false);

export async function asyncLoadUsers(): Promise<void> {
  isUsersLoading.set(true);
  const result = await getUsers();
  if (result.success) {
    users.set(result.data.users);
  } else {
    users.set([]);
    await showErrorDialog(result.message);
  }
  isUsersLoading.set(false);
}

export const asyncUpdateProfile = (name: string, email: string) =>
  runMutation(isMutatingProfile, () => putMe(name, email), asyncPreloadProfile);

export const asyncChangePhoto = (file: File) =>
  runMutation(isMutatingPhoto, () => postPhoto(file), asyncPreloadProfile);

export const asyncChangePassword = (password: string, newPassword: string) =>
  runMutation(isMutatingPassword, () => putPassword(password, newPassword));
