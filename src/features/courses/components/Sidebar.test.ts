import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/svelte";
import { click, renderWithProviders, setPage } from "../../../test-utils";
import Sidebar from "./Sidebar.svelte";

const renderAt = (path: string, open = true, onClose = vi.fn()) => {
  const result = renderWithProviders(Sidebar, { props: { open, onClose }, setup: () => setPage(path) });
  return { ...result, onClose };
};

describe("Sidebar", () => {
  it("menandai Semua Kursus aktif di beranda", () => {
    renderAt("/");
    expect(screen.getByText("Semua Kursus")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Pengguna")).not.toHaveAttribute("aria-current");
  });

  it("menandai Semua Kursus aktif di halaman kursus", () => {
    renderAt("/courses/3");
    expect(screen.getByText("Semua Kursus")).toHaveAttribute("aria-current", "page");
  });

  it("menandai Pengguna aktif", () => {
    renderAt("/users");
    expect(screen.getByText("Pengguna")).toHaveAttribute("aria-current", "page");
  });

  it("menandai Profil aktif", () => {
    renderAt("/profile");
    expect(screen.getByText("Profil")).toHaveAttribute("aria-current", "page");
  });

  it("tersembunyi di layar kecil saat tertutup", () => {
    renderAt("/", false);
    expect(screen.getByTestId("sidebar").className).toContain("hidden");
  });

  it("tampil saat terbuka", () => {
    renderAt("/", true);
    expect(screen.getByTestId("sidebar").className).toContain(" block");
  });

  it("menutup saat tautan atau tombol tutup diklik", async () => {
    const { onClose } = renderAt("/");
    await click(screen.getByText("Pengguna"));
    await click(screen.getByLabelText("Tutup menu"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
