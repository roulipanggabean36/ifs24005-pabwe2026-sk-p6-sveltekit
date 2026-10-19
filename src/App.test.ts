import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
vi.mock("./features/courses/api/courseApi");
vi.mock("./features/users/api/userApi");

import { goto } from "$app/navigation";
import { putAccessToken } from "./helpers/apiHelper";
import { getContent, getCourse, getCourses } from "./features/courses/api/courseApi";
import { getMe, getUsers } from "./features/users/api/userApi";
import {
  childSnippet,
  makeContent,
  makeCourse,
  makeDetail,
  ok,
  renderWithProviders,
  sampleUser,
  setPage,
} from "./test-utils";
import * as layoutModule from "./routes/+layout";
import RootLayout from "./routes/+layout.svelte";
import HomeRoute from "./routes/+page.svelte";
import ErrorRoute from "./routes/+error.svelte";
import AuthLayoutRoute from "./routes/auth/+layout.svelte";
import LoginRoute from "./routes/auth/login/+page.svelte";
import RegisterRoute from "./routes/auth/register/+page.svelte";
import UsersRoute from "./routes/users/+page.svelte";
import ProfileRoute from "./routes/profile/+page.svelte";
import CourseRoute from "./routes/courses/[courseId]/+page.svelte";
import ContentRoute from "./routes/courses/[courseId]/contents/[contentId]/+page.svelte";

const heading = (name: string) => screen.findByRole("heading", { name });

describe("routes", () => {
  it("+layout.ts menonaktifkan SSR", () => {
    expect(layoutModule.ssr).toBe(false);
  });

  describe("+layout.svelte", () => {
    it("mengarahkan tamu di halaman terlindungi ke halaman masuk", async () => {
      renderWithProviders(RootLayout, { props: { children: childSnippet("isi") } });
      await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
      expect(await screen.findByText("isi")).toBeInTheDocument();
    });

    it("tidak mengarahkan tamu di rute /auth dan tanpa layout kursus", async () => {
      renderWithProviders(RootLayout, {
        props: { children: childSnippet("isi") },
        setup: () => setPage("/auth/login"),
      });
      expect(await screen.findByText("isi")).toBeInTheDocument();
      expect(goto).not.toHaveBeenCalled();
      expect(screen.queryByText("Semua Kursus")).toBeNull();
    });

    it("membungkus rute lain dengan layout kursus saat sudah masuk", async () => {
      vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
      renderWithProviders(RootLayout, {
        props: { children: childSnippet("isi") },
        setup: () => putAccessToken("t"),
      });
      expect(await screen.findByText("isi")).toBeInTheDocument();
      expect(screen.getByText("Semua Kursus")).toBeInTheDocument();
      expect(goto).not.toHaveBeenCalled();
    });
  });

  it("+page.svelte menampilkan daftar kursus", async () => {
    vi.mocked(getCourses).mockResolvedValue(ok({ courses: [makeCourse()] }));
    renderWithProviders(HomeRoute);
    expect(await heading("Semua Kursus")).toBeInTheDocument();
    expect(await screen.findByText("Dasar C")).toBeInTheDocument();
  });

  it("+error.svelte menampilkan halaman tidak ditemukan", async () => {
    renderWithProviders(ErrorRoute);
    expect(await heading("Halaman tidak ditemukan")).toBeInTheDocument();
  });

  it("auth/+layout.svelte membungkus anak dengan layout autentikasi", () => {
    renderWithProviders(AuthLayoutRoute, { props: { children: childSnippet("formulir") } });
    expect(screen.getByText("formulir")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Delcom Courses" })).toBeInTheDocument();
  });

  it("rute login dan register", async () => {
    renderWithProviders(LoginRoute);
    expect(await heading("Masuk")).toBeInTheDocument();
  });

  it("rute register", async () => {
    renderWithProviders(RegisterRoute);
    expect(await heading("Daftar")).toBeInTheDocument();
  });

  it("rute users", async () => {
    vi.mocked(getUsers).mockResolvedValue(ok({ users: [sampleUser] }));
    renderWithProviders(UsersRoute);
    expect(await heading("Pengguna")).toBeInTheDocument();
    expect(await screen.findByText("Budi")).toBeInTheDocument();
  });

  it("rute profile", async () => {
    renderWithProviders(ProfileRoute);
    expect(await heading("Profil")).toBeInTheDocument();
  });

  it("rute detail kursus membaca parameter courseId", async () => {
    vi.mocked(getCourse).mockResolvedValue(ok({ course: makeDetail() }));
    renderWithProviders(CourseRoute, { setup: () => setPage("/courses/3", { courseId: "3" }) });
    expect(await heading("Dasar C")).toBeInTheDocument();
    expect(getCourse).toHaveBeenCalledWith("3");
  });

  it("rute materi membaca parameter courseId dan contentId", async () => {
    vi.mocked(getContent).mockResolvedValue(ok({ course_content: makeContent() }));
    renderWithProviders(ContentRoute, {
      setup: () => setPage("/courses/3/contents/11", { courseId: "3", contentId: "11" }),
    });
    expect(await heading("Dasar Java")).toBeInTheDocument();
    expect(getContent).toHaveBeenCalledWith("11");
  });
});
