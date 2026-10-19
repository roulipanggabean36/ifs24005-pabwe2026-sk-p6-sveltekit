import { describe, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";

vi.mock("../states/authStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/authStore")>()),
  asyncRegister: vi.fn(),
}));

import { goto } from "$app/navigation";
import { renderWithProviders } from "../../../test-utils";
import { asyncRegister } from "../states/authStore";
import RegisterPage from "./RegisterPage.svelte";

async function submitForm(container: HTMLElement) {
  await fireEvent.input(screen.getByLabelText("Nama"), { target: { value: "Budi" } });
  await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@b.c" } });
  await fireEvent.input(screen.getByLabelText("Kata Sandi"), { target: { value: "rahasia" } });
  await fireEvent.submit(container.querySelector("form")!);
}

describe("RegisterPage", () => {
  it("berhasil mendaftar lalu menuju halaman masuk", async () => {
    vi.mocked(asyncRegister).mockResolvedValue(true);
    const { container } = renderWithProviders(RegisterPage);
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/auth/login");
    await submitForm(container);
    await waitFor(() => expect(asyncRegister).toHaveBeenCalledWith("Budi", "a@b.c", "rahasia"));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("gagal mendaftar tetap di halaman", async () => {
    vi.mocked(asyncRegister).mockResolvedValue(false);
    const { container } = renderWithProviders(RegisterPage);
    await submitForm(container);
    await waitFor(() => expect(asyncRegister).toHaveBeenCalled());
    await tick();
    expect(goto).not.toHaveBeenCalled();
  });
});
