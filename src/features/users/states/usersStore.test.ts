import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
vi.mock("../api/userApi");

import Swal from "sweetalert2";
import { putAccessToken } from "../../../helpers/apiHelper";
import { fail, ok, sampleUser } from "../../../test-utils";
import { getUsers, getMe, postPhoto, putMe, putPassword } from "../api/userApi";
import {
  asyncChangePassword,
  asyncChangePhoto,
  asyncLoadUsers,
  asyncUpdateProfile,
  isUsersLoading,
  users,
} from "./usersStore";

describe("usersStore", () => {
  beforeEach(() => {
    users.set([]);
    putAccessToken("t");
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
    vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
  });

  it("asyncLoadUsers berhasil", async () => {
    vi.mocked(getUsers).mockResolvedValue(ok({ users: [sampleUser] }));
    await asyncLoadUsers();
    expect(get(users)).toEqual([sampleUser]);
    expect(get(isUsersLoading)).toBe(false);
  });

  it("asyncLoadUsers gagal", async () => {
    users.set([sampleUser]);
    vi.mocked(getUsers).mockResolvedValue(fail("Tidak sah"));
    await asyncLoadUsers();
    expect(get(users)).toEqual([]);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Tidak sah" }));
  });

  it("asyncUpdateProfile berhasil memuat ulang profil", async () => {
    vi.mocked(putMe).mockResolvedValue(ok());
    expect(await asyncUpdateProfile("Sari", "s@x.id")).toBe(true);
    expect(putMe).toHaveBeenCalledWith("Sari", "s@x.id");
    expect(getMe).toHaveBeenCalledTimes(1);
  });

  it("asyncUpdateProfile gagal", async () => {
    vi.mocked(putMe).mockResolvedValue(fail());
    expect(await asyncUpdateProfile("Sari", "s@x.id")).toBe(false);
    expect(getMe).not.toHaveBeenCalled();
  });

  it("asyncChangePhoto berhasil dan gagal", async () => {
    const file = new File(["x"], "p.png");
    vi.mocked(postPhoto).mockResolvedValueOnce(ok());
    expect(await asyncChangePhoto(file)).toBe(true);
    expect(postPhoto).toHaveBeenCalledWith(file);
    expect(getMe).toHaveBeenCalledTimes(1);
    vi.mocked(postPhoto).mockResolvedValueOnce(fail());
    expect(await asyncChangePhoto(file)).toBe(false);
    expect(getMe).toHaveBeenCalledTimes(1);
  });

  it("asyncChangePassword berhasil dan gagal", async () => {
    vi.mocked(putPassword).mockResolvedValueOnce(ok());
    expect(await asyncChangePassword("lama", "baru")).toBe(true);
    expect(putPassword).toHaveBeenCalledWith("lama", "baru");
    vi.mocked(putPassword).mockResolvedValueOnce(fail());
    expect(await asyncChangePassword("lama", "baru")).toBe(false);
  });
});
