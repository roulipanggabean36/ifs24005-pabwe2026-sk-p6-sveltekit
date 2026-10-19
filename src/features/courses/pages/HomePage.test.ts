import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/svelte";

vi.mock("../states/coursesStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/coursesStore")>()),
  asyncLoadCourses: vi.fn(),
  asyncDeleteCourse: vi.fn(),
  asyncDeleteAllCourses: vi.fn(),
}));

import { click, makeCourse, renderWithProviders, sampleUser } from "../../../test-utils";
import { authProfile } from "../../auth/states/authStore";
import {
  asyncDeleteAllCourses,
  asyncDeleteCourse,
  asyncLoadCourses,
  courses,
  isCoursesLoading,
} from "../states/coursesStore";
import HomePage from "./HomePage.svelte";

const list = [
  makeCourse({ id: 1, user_id: 1, title: "Belajar React", cover: null, avg_ratings: null }),
  makeCourse({ id: 2, user_id: 9, title: "Dasar Python", avg_ratings: "4.5000", students: [1, 2] }),
];

const renderHome = () =>
  renderWithProviders(HomePage, {
    setup: () => {
      authProfile.set(sampleUser);
      courses.set(list);
    },
  });

describe("HomePage", () => {
  it("memuat kursus saat dibuka dan menampilkan status memuat", () => {
    renderWithProviders(HomePage, { setup: () => isCoursesLoading.set(true) });
    expect(asyncLoadCourses).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat kursus...");
  });

  it("menampilkan keadaan kosong", () => {
    renderWithProviders(HomePage);
    expect(screen.getByText("Belum ada kursus yang cocok.")).toBeInTheDocument();
  });

  it("menampilkan kartu kursus lengkap dengan rating dan sampul", () => {
    renderHome();
    expect(screen.getByRole("heading", { name: "Belajar React" })).toBeInTheDocument();
    expect(screen.getByText("Belum ada rating")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByAltText("Sampul Dasar Python")).toBeInTheDocument();
    expect(screen.queryByAltText("Sampul Belajar React")).toBeNull();
  });

  it("hanya menawarkan hapus untuk kursus milik sendiri", async () => {
    renderHome();
    expect(screen.queryByLabelText("Hapus Dasar Python")).toBeNull();
    await click(screen.getByLabelText("Hapus Belajar React"));
    expect(asyncDeleteCourse).toHaveBeenCalledWith(1);
  });

  it("menyaring berdasarkan pencarian", async () => {
    renderHome();
    const input = screen.getByLabelText("Cari kursus");
    await fireEvent.input(input, { target: { value: "python" } });
    expect(screen.queryByText("Belajar React")).toBeNull();
    expect(screen.getByText("Dasar Python")).toBeInTheDocument();
    await fireEvent.input(input, { target: { value: "tidak ada" } });
    expect(screen.getByText("Belum ada kursus yang cocok.")).toBeInTheDocument();
  });

  it("menyaring kursus milik saya", async () => {
    renderHome();
    await click(screen.getByLabelText("Kursus milik saya"));
    expect(screen.getByText("Belajar React")).toBeInTheDocument();
    expect(screen.queryByText("Dasar Python")).toBeNull();
  });

  it("membuka dan menutup modal tambah kursus", async () => {
    renderHome();
    await click(screen.getByRole("button", { name: "Tambah Kursus" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await click(screen.getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("menghapus semua kursus", async () => {
    renderHome();
    await click(screen.getByRole("button", { name: "Hapus Semua" }));
    expect(asyncDeleteAllCourses).toHaveBeenCalledTimes(1);
  });
});
