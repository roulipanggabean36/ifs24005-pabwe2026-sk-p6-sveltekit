import { describe, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
vi.mock("../states/usersStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/usersStore")>()),
  asyncUpdateProfile: vi.fn(),
  asyncChangePhoto: vi.fn(),
  asyncChangePassword: vi.fn(),
}));

import Swal from "sweetalert2";
import { renderWithProviders, sampleUser } from "../../../test-utils";
import { authProfile } from "../../auth/states/authStore";
import { asyncChangePassword, asyncChangePhoto, asyncUpdateProfile } from "../states/usersStore";
import ProfilePage from "./ProfilePage.svelte";

const withProfile = () => renderWithProviders(ProfilePage, { setup: () => authProfile.set(sampleUser) });

async function fillPasswords(oldValue: string, newValue: string, confirmValue: string) {
  await fireEvent.input(screen.getByLabelText("Kata Sandi Lama"), { target: { value: oldValue } });
  await fireEvent.input(screen.getByLabelText("Kata Sandi Baru"), { target: { value: newValue } });
  await fireEvent.input(screen.getByLabelText("Konfirmasi Kata Sandi Baru"), { target: { value: confirmValue } });
}

describe("ProfilePage", () => {
  it("terisi data profil dan menampilkan foto", () => {
    withProfile();
    expect(screen.getByLabelText("Nama")).toHaveValue("Budi");
    expect(screen.getByLabelText("Email")).toHaveValue("budi@del.ac.id");
    expect(screen.getByAltText("Foto Budi")).toBeInTheDocument();
  });

  it("tetap tampil tanpa profil", () => {
    renderWithProviders(ProfilePage);
    expect(screen.getByLabelText("Nama")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.queryByAltText(/Foto Budi/)).toBeNull();
  });

  it("menyimpan data diri", async () => {
    const { container } = withProfile();
    await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: "Sari" } });
    await fireEvent.submit(container.querySelectorAll("form")[0]);
    await waitFor(() => expect(asyncUpdateProfile).toHaveBeenCalledWith("Sari", "budi@del.ac.id"));
  });

  it("mengunggah foto yang dipilih", async () => {
    withProfile();
    const file = new File(["x"], "p.png", { type: "image/png" });
    await fireEvent.change(screen.getByLabelText("Foto Profil"), { target: { files: [file] } });
    await waitFor(() => expect(asyncChangePhoto).toHaveBeenCalledWith(file));
  });

  it("mengabaikan perubahan tanpa berkas", async () => {
    withProfile();
    await fireEvent.change(screen.getByLabelText("Foto Profil"), { target: { files: [] } });
    await tick();
    expect(asyncChangePhoto).not.toHaveBeenCalled();
  });

  it("menolak konfirmasi kata sandi yang berbeda", async () => {
    const { container } = withProfile();
    await fillPasswords("lama", "baru", "beda");
    await fireEvent.submit(container.querySelectorAll("form")[1]);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error" }))
    );
    expect(asyncChangePassword).not.toHaveBeenCalled();
  });

  it("mengubah kata sandi dan mengosongkan isian saat berhasil", async () => {
    vi.mocked(asyncChangePassword).mockResolvedValue(true);
    const { container } = withProfile();
    await fillPasswords("lama", "baru", "baru");
    await fireEvent.submit(container.querySelectorAll("form")[1]);
    await waitFor(() => expect(asyncChangePassword).toHaveBeenCalledWith("lama", "baru"));
    await waitFor(() => expect(screen.getByLabelText("Kata Sandi Baru")).toHaveValue(""));
  });

  it("mempertahankan isian saat perubahan kata sandi gagal", async () => {
    vi.mocked(asyncChangePassword).mockResolvedValue(false);
    const { container } = withProfile();
    await fillPasswords("lama", "baru", "baru");
    await fireEvent.submit(container.querySelectorAll("form")[1]);
    await waitFor(() => expect(asyncChangePassword).toHaveBeenCalled());
    await tick();
    expect(screen.getByLabelText("Kata Sandi Baru")).toHaveValue("baru");
  });
});
