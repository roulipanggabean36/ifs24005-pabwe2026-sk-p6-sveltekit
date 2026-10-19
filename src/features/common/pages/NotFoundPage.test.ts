import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/svelte";
import { renderWithProviders } from "../../../test-utils";
import NotFoundPage from "./NotFoundPage.svelte";

describe("NotFoundPage", () => {
  it("menampilkan pesan dan tautan beranda", () => {
    renderWithProviders(NotFoundPage);
    expect(screen.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke beranda" })).toHaveAttribute("href", "/");
  });
});
