import { beforeEach, describe, expect, it, vi } from "vitest";
import { get, writable } from "svelte/store";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

import Swal from "sweetalert2";
import {
  formatDate,
  formatRating,
  getYoutubeId,
  notifyResult,
  resolveAssetUrl,
  runMutation,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper";

const fire = vi.mocked(Swal.fire);
const okResult = { success: true, message: "ok", data: null };
const failResult = { success: false, message: "gagal", data: null };

describe("toolsHelper", () => {
  beforeEach(() => {
    fire.mockResolvedValue({ isConfirmed: true } as never);
  });

  it("menampilkan dialog sukses, galat, dan peringatan", async () => {
    await showSuccessDialog("a");
    await showErrorDialog("b");
    await showWarningDialog("c");
    expect(fire.mock.calls.map((call: any) => call[0].icon)).toEqual(["success", "error", "warning"]);
  });

  it("showConfirmDialog mengembalikan pilihan pengguna", async () => {
    expect(await showConfirmDialog("t", "x")).toBe(true);
    fire.mockResolvedValueOnce({ isConfirmed: false } as never);
    expect(await showConfirmDialog("t", "x")).toBe(false);
  });

  it("notifyResult menampilkan dialog sesuai hasil", async () => {
    expect(await notifyResult(okResult)).toBe(true);
    expect(await notifyResult(failResult)).toBe(false);
    expect(fire.mock.calls.map((call: any) => call[0].icon)).toEqual(["success", "error"]);
  });

  it("runMutation mengatur bendera dan memuat ulang saat berhasil", async () => {
    const flag = writable(false);
    const seen: boolean[] = [];
    flag.subscribe((value) => seen.push(value));
    const reload = vi.fn().mockResolvedValue(undefined);
    expect(await runMutation(flag, async () => okResult, reload)).toBe(true);
    expect(seen).toEqual([false, true, false]);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("runMutation tidak memuat ulang saat gagal", async () => {
    const reload = vi.fn();
    expect(await runMutation(writable(false), async () => failResult, reload)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("runMutation memakai pemuatan ulang bawaan", async () => {
    const flag = writable(false);
    expect(await runMutation(flag, async () => okResult)).toBe(true);
    expect(get(flag)).toBe(false);
  });

  it("formatDate memakai locale Indonesia", () => {
    expect(formatDate("2024-10-06T01:27:37.000000Z")).toContain("2024");
  });

  it("formatRating", () => {
    expect(formatRating(null)).toBe("Belum ada rating");
    expect(formatRating("4.0000")).toBe("4.0");
  });

  it("getYoutubeId membaca beberapa bentuk tautan", () => {
    expect(getYoutubeId("https://youtu.be/uHyfQV0kbgo")).toBe("uHyfQV0kbgo");
    expect(getYoutubeId("https://www.youtube.com/watch?v=uHyfQV0kbgo&t=1")).toBe("uHyfQV0kbgo");
    expect(getYoutubeId("https://www.youtube.com/embed/uHyfQV0kbgo")).toBe("uHyfQV0kbgo");
    expect(getYoutubeId("https://example.com/video")).toBeNull();
  });

  it("resolveAssetUrl", () => {
    expect(resolveAssetUrl("https://cdn.test/a.png")).toBe("https://cdn.test/a.png");
    expect(resolveAssetUrl("img/a.png")).toBe(new URL("/img/a.png", DELCOM_BASEURL).href);
  });
});
