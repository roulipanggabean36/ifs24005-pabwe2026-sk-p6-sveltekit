import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
vi.mock("../api/authApi");
vi.mock("../../users/api/userApi");

import Swal from "sweetalert2";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { fail, ok, sampleUser } from "../../../test-utils";
import { getMe } from "../../users/api/userApi";
import { postLogin, postLogout, postRegister } from "../api/authApi";
import {
  asyncLogin,
  asyncLogout,
  asyncPreloadProfile,
  asyncRegister,
  authProfile,
  authToken,
  isAuthLoading,
  isAuthLogin,
  profileId,
  resetSession,
  sessionReady,
} from "./authStore";

const fire = vi.mocked(Swal.fire);

describe("authStore", () => {
  beforeEach(() => {
    resetSession();
    isAuthLoading.set(false);
    fire.mockResolvedValue({ isConfirmed: true } as never);
  });

  it("sessionReady hanya true jika token, login, dan profil siap", () => {
    expect(get(sessionReady)).toBe(false);
    authToken.set("t");
    expect(get(sessionReady)).toBe(false);
    isAuthLogin.set(true);
    expect(get(sessionReady)).toBe(false);
    authProfile.set(sampleUser);
    expect(get(sessionReady)).toBe(true);
  });

  it("profileId bernilai 0 tanpa profil", () => {
    expect(get(profileId)).toBe(0);
    authProfile.set(sampleUser);
    expect(get(profileId)).toBe(sampleUser.id);
  });

  it("asyncPreloadProfile gagal tanpa token", async () => {
    expect(await asyncPreloadProfile()).toBe(false);
    expect(getMe).not.toHaveBeenCalled();
  });

  it("asyncPreloadProfile berhasil dengan token valid", async () => {
    putAccessToken("t");
    vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
    expect(await asyncPreloadProfile()).toBe(true);
    expect(get(sessionReady)).toBe(true);
  });

  it("asyncPreloadProfile menghapus token yang ditolak server", async () => {
    putAccessToken("t");
    vi.mocked(getMe).mockResolvedValue(fail());
    expect(await asyncPreloadProfile()).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(get(sessionReady)).toBe(false);
  });

  it("asyncLogin berhasil menyimpan token dan memuat profil", async () => {
    vi.mocked(postLogin).mockResolvedValue(ok({ token: "tok", user: sampleUser }));
    vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
    expect(await asyncLogin("a@b.c", "pw")).toBe(true);
    expect(postLogin).toHaveBeenCalledWith("a@b.c", "pw");
    expect(getAccessToken()).toBe("tok");
    expect(get(sessionReady)).toBe(true);
    expect(get(isAuthLoading)).toBe(false);
  });

  it("asyncLogin gagal menampilkan dialog galat", async () => {
    vi.mocked(postLogin).mockResolvedValue(fail("Kredensial salah"));
    expect(await asyncLogin("a@b.c", "pw")).toBe(false);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Kredensial salah" }));
    expect(get(isAuthLoading)).toBe(false);
  });

  it("asyncRegister berhasil dan gagal", async () => {
    vi.mocked(postRegister).mockResolvedValueOnce(ok());
    expect(await asyncRegister("Budi", "a@b.c", "pw")).toBe(true);
    expect(postRegister).toHaveBeenCalledWith("Budi", "a@b.c", "pw");
    vi.mocked(postRegister).mockResolvedValueOnce(fail());
    expect(await asyncRegister("Budi", "a@b.c", "pw")).toBe(false);
    expect(get(isAuthLoading)).toBe(false);
  });

  it("asyncLogout dibatalkan", async () => {
    fire.mockResolvedValueOnce({ isConfirmed: false } as never);
    expect(await asyncLogout()).toBe(false);
    expect(postLogout).not.toHaveBeenCalled();
  });

  it("asyncLogout menghapus sesi", async () => {
    putAccessToken("t");
    authToken.set("t");
    vi.mocked(postLogout).mockResolvedValue(ok());
    expect(await asyncLogout()).toBe(true);
    expect(postLogout).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    expect(get(authToken)).toBeNull();
  });
});
