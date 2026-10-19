import { describe, expect, it } from "vitest";
import { get } from "svelte/store";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("dimulai dari string kosong bila tanpa argumen", () => {
    expect(get(useInput().value)).toBe("");
  });

  it("onChange memperbarui nilai dan reset mengembalikannya", () => {
    const { value, onChange, reset } = useInput("awal");
    expect(get(value)).toBe("awal");
    onChange({ target: { value: "baru" } } as unknown as Event);
    expect(get(value)).toBe("baru");
    reset();
    expect(get(value)).toBe("awal");
  });
});
