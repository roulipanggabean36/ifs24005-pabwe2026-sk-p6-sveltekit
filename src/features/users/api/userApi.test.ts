import { describe, expect, it, vi } from "vitest";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn() }));

import { apiRequest } from "../../../helpers/apiHelper";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "./userApi";

describe("userApi", () => {
  it("getUsers dan getMe", () => {
    getUsers();
    getMe();
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/users");
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/users/me");
  });

  it("putMe", () => {
    putMe("Budi", "b@x.id");
    expect(apiRequest).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "Budi", email: "b@x.id" },
    });
  });

  it("postPhoto mengirim FormData berisi photo", () => {
    postPhoto(new File(["x"], "p.png"));
    const [path, options] = vi.mocked(apiRequest).mock.calls[0] as any;
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect((options.body.get("photo") as File).name).toBe("p.png");
  });

  it("putPassword mengirim konfirmasi", () => {
    putPassword("lama", "baru");
    expect(apiRequest).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: { password: "lama", new_password: "baru", new_password_confirmation: "baru" },
    });
  });
});
