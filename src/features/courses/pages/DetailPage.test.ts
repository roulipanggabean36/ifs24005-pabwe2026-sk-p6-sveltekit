import { describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import { tick } from "svelte";
import { fireEvent, screen, waitFor } from "@testing-library/svelte";

vi.mock("../states/coursesStore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../states/coursesStore")>()),
  asyncLoadCourse: vi.fn(),
  asyncDeleteCourse: vi.fn(),
  asyncJoinCourse: vi.fn(),
  asyncLeaveCourse: vi.fn(),
  asyncRateCourse: vi.fn(),
  asyncDeleteContent: vi.fn(),
  asyncChangeCourse: vi.fn(),
  asyncChangeCover: vi.fn(),
  asyncAddContent: vi.fn(),
  asyncChangeContent: vi.fn(),
}));

import { goto } from "$app/navigation";
import { click, makeContent, makeDetail, renderWithProviders, sampleUser } from "../../../test-utils";
import { authProfile } from "../../auth/states/authStore";
import {
  asyncDeleteContent,
  asyncDeleteCourse,
  asyncJoinCourse,
  asyncLeaveCourse,
  asyncLoadCourse,
  asyncRateCourse,
  course,
  isCourseLoading,
} from "../states/coursesStore";
import DetailPage from "./DetailPage.svelte";

const props = { courseId: "3" };

const owner = makeDetail({
  user_id: 1,
  contents: [
    makeContent({ id: 11, title: "Intro", my_status_finished: true }),
    makeContent({ id: 12, title: "Lanjut" }),
  ],
  ratings: [{ name: "Sari", ratings: 5, comment: "Mantap" }],
});

const as = (userId: number, detail: unknown) => () => {
  authProfile.set({ ...sampleUser, id: userId });
  course.set(detail as any);
};

describe("DetailPage", () => {
  it("menampilkan status memuat", () => {
    renderWithProviders(DetailPage, { props, setup: () => isCourseLoading.set(true) });
    expect(asyncLoadCourse).toHaveBeenCalledWith("3");
    expect(screen.getByRole("status")).toHaveTextContent("Memuat kursus...");
  });

  it("menampilkan pesan bila kursus tidak ditemukan", () => {
    renderWithProviders(DetailPage, { props });
    expect(screen.getByText("Kursus tidak ditemukan.")).toBeInTheDocument();
  });

  it("tampilan pemilik: sampul, konten, rating, dan pembersihan saat ditutup", () => {
    const { unmount } = renderWithProviders(DetailPage, { props, setup: as(1, owner) });
    expect(screen.getByRole("heading", { name: "Dasar C" })).toBeInTheDocument();
    expect(screen.getByAltText("Sampul Dasar C")).toBeInTheDocument();
    for (const name of ["Ubah Data", "Ubah Sampul", "Tambah Konten", "Hapus Kursus"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    expect(screen.getAllByTitle("Selesai")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Intro" })).toHaveAttribute("href", "/courses/3/contents/11");
    expect(screen.getByText("Mantap")).toBeInTheDocument();
    expect(screen.queryByText("Keluar dari Kursus")).toBeNull();
    unmount();
    expect(get(course)).toBeNull();
  });

  it("pemilik mengelola modal data, sampul, dan konten", async () => {
    renderWithProviders(DetailPage, { props, setup: as(1, owner) });

    await click(screen.getByRole("button", { name: "Ubah Data" }));
    expect(screen.getByRole("dialog", { name: "Ubah Kursus" })).toBeInTheDocument();
    await click(screen.getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).toBeNull();

    await click(screen.getByRole("button", { name: "Ubah Sampul" }));
    expect(screen.getByRole("dialog", { name: "Ubah Sampul" })).toBeInTheDocument();
    await click(screen.getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).toBeNull();

    await click(screen.getByRole("button", { name: "Tambah Konten" }));
    expect(screen.getByRole("heading", { name: "Tambah Konten" })).toBeInTheDocument();
    await click(screen.getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).toBeNull();

    await click(screen.getByLabelText("Ubah Intro"));
    expect(screen.getByRole("heading", { name: "Ubah Konten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Judul")).toHaveValue("Intro");
    await click(screen.getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("pemilik menghapus konten", async () => {
    renderWithProviders(DetailPage, { props, setup: as(1, owner) });
    await click(screen.getByLabelText("Hapus Intro"));
    expect(asyncDeleteContent).toHaveBeenCalledWith("3", 11);
  });

  it("pemilik menghapus kursus lalu kembali ke beranda", async () => {
    vi.mocked(asyncDeleteCourse).mockResolvedValue(true);
    renderWithProviders(DetailPage, { props, setup: as(1, owner) });
    await click(screen.getByRole("button", { name: "Hapus Kursus" }));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });

  it("penghapusan kursus yang dibatalkan tidak berpindah halaman", async () => {
    vi.mocked(asyncDeleteCourse).mockResolvedValue(false);
    renderWithProviders(DetailPage, { props, setup: as(1, owner) });
    await click(screen.getByRole("button", { name: "Hapus Kursus" }));
    await waitFor(() => expect(asyncDeleteCourse).toHaveBeenCalledWith("3"));
    await tick();
    expect(goto).not.toHaveBeenCalled();
  });

  it("antarmuka pemilik didahulukan bila juga peserta", () => {
    renderWithProviders(DetailPage, { props, setup: as(1, makeDetail({ user_id: 1, students: [1] })) });
    expect(screen.getByRole("button", { name: "Ubah Data" })).toBeInTheDocument();
    expect(screen.queryByText("Keluar dari Kursus")).toBeNull();
  });

  it("tampilan peserta: progres, keluar, dan kirim rating", async () => {
    const detail = makeDetail({
      user_id: 5,
      students: [2],
      my_percentage_finished: "50.00",
      contents: [makeContent({ id: 11, title: "Dasar Java" })],
    });
    const { container } = renderWithProviders(DetailPage, { props, setup: as(2, detail) });
    expect(screen.getByText("Progres belajar: 50.00%")).toBeInTheDocument();
    expect(screen.getByText("Belum ada rating.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dasar Java" })).toHaveAttribute("href", "/courses/3/contents/11");

    await click(screen.getByRole("button", { name: "Keluar dari Kursus" }));
    expect(asyncLeaveCourse).toHaveBeenCalledWith("3");

    await fireEvent.change(screen.getByLabelText("Nilai"), { target: { value: "3" } });
    await fireEvent.input(screen.getByLabelText("Komentar"), { target: { value: "Bagus" } });
    await fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(asyncRateCourse).toHaveBeenCalledWith("3", 3, "Bagus"));
  });

  it("peserta tanpa konten melihat pesan kosong", () => {
    renderWithProviders(DetailPage, { props, setup: as(2, makeDetail({ user_id: 5, students: [2], contents: [] })) });
    expect(screen.getByText("Belum ada konten.")).toBeInTheDocument();
  });

  it("tampilan tamu: daftar kursus dan konten terkunci", async () => {
    const detail = makeDetail({ user_id: 5, students: [], cover: null });
    renderWithProviders(DetailPage, { props, setup: as(9, detail) });
    expect(screen.queryByAltText("Sampul Dasar C")).toBeNull();
    expect(screen.queryByRole("link", { name: "Dasar Java" })).toBeNull();
    expect(screen.getByText("Dasar Java")).toBeInTheDocument();
    await click(screen.getByRole("button", { name: "Daftar Kursus" }));
    expect(asyncJoinCourse).toHaveBeenCalledWith("3");
  });
});
