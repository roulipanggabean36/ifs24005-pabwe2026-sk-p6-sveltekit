import { derived, writable } from "svelte/store";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";
import {
  notifyResult,
  showConfirmDialog,
  showErrorDialog,
} from "../../../helpers/toolsHelper";
import { getMe, type User } from "../../users/api/userApi";
import { postLogin, postLogout, postRegister } from "../api/authApi";

export const authToken = writable<string | null>(null);
export const authProfile = writable<User | null>(null);
export const isAuthLogin = writable(false);
export const isAuthLoading = writable(false);

export const sessionReady = derived(
  [authToken, isAuthLogin, authProfile],
  ([token, login, profile]) => Boolean(token && login && profile)
);

export const profileId = derived(authProfile, (profile) => (profile ? profile.id : 0));

export function resetSession(): void {
  authToken.set(null);
  authProfile.set(null);
  isAuthLogin.set(false);
}

export async function asyncPreloadProfile(): Promise<boolean> {
  const token = getAccessToken();
  if (!token) {
    resetSession();
    return false;
  }
  const result = await getMe();
  if (!result.success) {
    removeAccessToken();
    resetSession();
    return false;
  }
  authToken.set(token);
  authProfile.set(result.data.user);
  isAuthLogin.set(true);
  return true;
}

export async function asyncLogin(email: string, password: string): Promise<boolean> {
  isAuthLoading.set(true);
  const result = await postLogin(email, password);
  if (result.success) {
    putAccessToken(result.data.token);
    await asyncPreloadProfile();
  } else {
    await showErrorDialog(result.message);
  }
  isAuthLoading.set(false);
  return result.success;
}

export async function asyncRegister(
  name: string,
  email: string,
  password: string
): Promise<boolean> {
  isAuthLoading.set(true);
  const result = await postRegister(name, email, password);
  isAuthLoading.set(false);
  return notifyResult(result);
}

export async function asyncLogout(): Promise<boolean> {
  if (!(await showConfirmDialog("Keluar", "Yakin ingin keluar dari akun?"))) return false;
  await postLogout();
  removeAccessToken();
  resetSession();
  return true;
}
