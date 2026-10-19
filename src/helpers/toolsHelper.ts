import Swal from "sweetalert2";
import type { Writable } from "svelte/store";
import type { ApiResult } from "./apiHelper";

const ACCENT = "#4f46e5";

export function showSuccessDialog(message: string) {
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: 1600,
    showConfirmButton: false,
  });
}

export function showErrorDialog(message: string) {
  return Swal.fire({ icon: "error", title: "Gagal", text: message, confirmButtonColor: ACCENT });
}

export function showWarningDialog(message: string) {
  return Swal.fire({ icon: "warning", title: "Perhatian", text: message, confirmButtonColor: ACCENT });
}

export async function showConfirmDialog(title: string, text: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    confirmButtonColor: ACCENT,
  });
  return result.isConfirmed;
}

export async function notifyResult(result: ApiResult): Promise<boolean> {
  if (result.success) await showSuccessDialog(result.message);
  else await showErrorDialog(result.message);
  return result.success;
}

export async function runMutation(
  flag: Writable<boolean>,
  request: () => Promise<ApiResult>,
  reload: () => Promise<unknown> = async () => undefined
): Promise<boolean> {
  flag.set(true);
  const result = await request();
  flag.set(false);
  const ok = await notifyResult(result);
  if (ok) await reload();
  return ok;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRating(value: string | null): string {
  return value === null ? "Belum ada rating" : Number(value).toFixed(1);
}

export function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export function resolveAssetUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : new URL(`/${path}`, DELCOM_BASEURL).href;
}
