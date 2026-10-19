import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";

vi.mock("../../auth/states/authStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../auth/states/authStore")>()),
  asyncLogout: vi.fn(),
}));

import { goto } from "$app/navigation";
import { click, renderWithProviders, sampleUser } from "../../../test-utils";
import { asyncLogout, authProfile } from "../../auth/states/authStore";
import Navbar from "./Navbar.svelte";

describe("Navbar", () => {
  it("menampilkan logo dan memanggil toggle sidebar tanpa profil", async () => {
    const onToggleSidebar = vi.fn();
    renderWithProviders(Navbar, { props: { onToggleSidebar } });
    expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
    expect(screen.queryByAltText("Budi")).toBeNull();
    await click(screen.getByLabelText("Buka menu"));
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("menampilkan foto dan nama profil", () => {
    renderWithProviders(Navbar, {
      props: { onToggleSidebar: vi.fn() },
      setup: () => authProfile.set(sampleUser),
    });
    expect(document.querySelector("img")).toHaveAttribute("src", expect.stringContaining("1.png"));
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });

  it("keluar berhasil mengarahkan ke halaman masuk", async () => {
    vi.mocked(asyncLogout).mockResolvedValue(true);
    renderWithProviders(Navbar, { props: { onToggleSidebar: vi.fn() } });
    await click(screen.getByLabelText("Keluar"));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
  });

  it("keluar dibatalkan tidak berpindah halaman", async () => {
    vi.mocked(asyncLogout).mockResolvedValue(false);
    renderWithProviders(Navbar, { props: { onToggleSidebar: vi.fn() } });
    await click(screen.getByLabelText("Keluar"));
    await waitFor(() => expect(asyncLogout).toHaveBeenCalled());
    await tick();
    expect(goto).not.toHaveBeenCalled();
  });
});
