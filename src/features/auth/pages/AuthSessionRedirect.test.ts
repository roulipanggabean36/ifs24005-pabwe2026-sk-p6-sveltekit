import { describe, expect, it } from "vitest";
import { tick } from "svelte";
import { waitFor } from "@testing-library/svelte";
import { goto } from "$app/navigation";
import { renderWithProviders, sampleUser } from "../../../test-utils";
import { authProfile, authToken, isAuthLogin } from "../states/authStore";
import AuthSessionRedirect from "./AuthSessionRedirect.svelte";

describe("AuthSessionRedirect", () => {
  it("tidak berpindah sebelum profil siap", async () => {
    renderWithProviders(AuthSessionRedirect);
    authToken.set("t");
    isAuthLogin.set(true);
    await tick();
    await tick();
    expect(goto).not.toHaveBeenCalled();
  });

  it("berpindah ke beranda setelah token, login, dan profil siap", async () => {
    renderWithProviders(AuthSessionRedirect);
    authToken.set("t");
    isAuthLogin.set(true);
    authProfile.set(sampleUser);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });
});
