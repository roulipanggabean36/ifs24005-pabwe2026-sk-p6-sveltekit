import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/svelte";

vi.mock("../states/usersStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/usersStore")>()),
  asyncLoadUsers: vi.fn(),
}));

import { renderWithProviders, sampleUser } from "../../../test-utils";
import { asyncLoadUsers, isUsersLoading, users } from "../states/usersStore";
import UsersPage from "./UsersPage.svelte";

describe("UsersPage", () => {
  it("memuat pengguna saat dibuka dan menampilkan status memuat", () => {
    renderWithProviders(UsersPage, { setup: () => isUsersLoading.set(true) });
    expect(asyncLoadUsers).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat pengguna...");
  });

  it("menampilkan keadaan kosong", () => {
    renderWithProviders(UsersPage);
    expect(screen.getByText("Belum ada pengguna.")).toBeInTheDocument();
  });

  it("menampilkan daftar pengguna", () => {
    renderWithProviders(UsersPage, {
      setup: () => users.set([sampleUser, { ...sampleUser, id: 2, name: "Sari", email: "sari@del.ac.id" }]),
    });
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("sari@del.ac.id")).toBeInTheDocument();
    expect(screen.getByAltText("Foto Sari")).toBeInTheDocument();
  });
});
