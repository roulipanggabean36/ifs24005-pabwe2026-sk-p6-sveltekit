import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/svelte";
import { childSnippet, renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout.svelte";

describe("AuthLayout", () => {
  it("menampilkan identitas kursus dan anak", () => {
    renderWithProviders(AuthLayout, { props: { children: childSnippet("formulir") } });
    expect(screen.getByRole("heading", { name: "Delcom Courses" })).toBeInTheDocument();
    expect(screen.getByText(/kursus video/)).toBeInTheDocument();
    expect(screen.getByText("formulir")).toBeInTheDocument();
  });
});
