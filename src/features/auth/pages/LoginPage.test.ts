import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";

vi.mock("../states/authStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/authStore")>()),
  asyncLogin: vi.fn(),
}));

import { renderWithProviders } from "../../../test-utils";
import { asyncLogin } from "../states/authStore";
import LoginPage from "./LoginPage.svelte";

describe("LoginPage", () => {
  it("mengirim email dan kata sandi", async () => {
    vi.mocked(asyncLogin).mockResolvedValue(true);
    const { container } = renderWithProviders(LoginPage);
    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute("href", "/auth/register");
    await fireEvent.input(screen.getByLabelText("Email"), { target: { value: "a@b.c" } });
    await fireEvent.input(screen.getByLabelText("Kata Sandi"), { target: { value: "rahasia" } });
    await fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(asyncLogin).toHaveBeenCalledWith("a@b.c", "rahasia"));
  });
});
