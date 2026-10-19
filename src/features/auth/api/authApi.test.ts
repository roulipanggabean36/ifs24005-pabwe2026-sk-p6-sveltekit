import { describe, expect, it, vi } from "vitest";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn() }));

import { apiRequest } from "../../../helpers/apiHelper";
import { postLogin, postLogout, postRegister } from "./authApi";

describe("authApi", () => {
  it("postLogin tanpa token", () => {
    postLogin("a@b.c", "pw");
    expect(apiRequest).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "pw" },
      auth: false,
    });
  });

  it("postRegister tanpa token", () => {
    postRegister("Budi", "a@b.c", "pw");
    expect(apiRequest).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "Budi", email: "a@b.c", password: "pw" },
      auth: false,
    });
  });

  it("postLogout memakai token", () => {
    postLogout();
    expect(apiRequest).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});
