import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/svelte";
import { childSnippet, click, renderWithProviders } from "../../../test-utils";
import CourseLayout from "./CourseLayout.svelte";

describe("CourseLayout", () => {
  it("membungkus anak dengan navbar dan sidebar", () => {
    renderWithProviders(CourseLayout, { props: { children: childSnippet("isi halaman") } });
    expect(screen.getByText("isi halaman")).toBeInTheDocument();
    expect(screen.getByText("Delcom Courses")).toBeInTheDocument();
    expect(screen.getByText("Semua Kursus")).toBeInTheDocument();
  });

  it("membuka dan menutup sidebar", async () => {
    renderWithProviders(CourseLayout, { props: { children: childSnippet("isi") } });
    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar.className).toContain("hidden");
    await click(screen.getByLabelText("Buka menu"));
    expect(sidebar.className).not.toContain("hidden");
    await click(screen.getByLabelText("Tutup menu"));
    expect(sidebar.className).toContain("hidden");
  });
});
