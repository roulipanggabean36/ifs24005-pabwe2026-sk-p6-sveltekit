import { render } from "@testing-library/svelte";
import { createRawSnippet, tick } from "svelte";
import { page } from "$app/state";
import {
  authProfile,
  authToken,
  isAuthLoading,
  isAuthLogin,
} from "./features/auth/states/authStore";
import {
  course,
  courseContent,
  courses,
  isContentLoading,
  isCourseLoading,
  isCoursesLoading,
} from "./features/courses/states/coursesStore";
import { isUsersLoading, users } from "./features/users/states/usersStore";

export const sampleUser = {
  id: 1,
  name: "Budi",
  email: "budi@del.ac.id",
  photo: "img/profile/1.png",
};

export const ok = (data?: unknown) => ({ success: true, message: "Berhasil", data });
export const fail = (message = "Gagal") => ({ success: false, message, data: undefined });

export function makeContent(overrides: Record<string, unknown> = {}) {
  return {
    id: 11,
    course_id: 3,
    title: "Dasar Java",
    youtube: "https://youtu.be/uHyfQV0kbgo",
    my_status_finished: false,
    ...overrides,
  } as any;
}

export function makeCourse(overrides: Record<string, unknown> = {}) {
  return {
    id: 3,
    user_id: 1,
    title: "Dasar C",
    cover: "http://img.test/cover.png",
    description: "Belajar dasar C",
    author: { name: "Budi", photo: "x.png" },
    students: [] as number[],
    total_contents: 1,
    avg_ratings: "4.0000",
    ...overrides,
  } as any;
}

export function makeDetail(overrides: Record<string, unknown> = {}) {
  return {
    ...makeCourse(),
    contents: [makeContent()],
    ratings: [],
    my_percentage_finished: "0.00",
    ...overrides,
  } as any;
}

export function setPage(path: string, params: Record<string, string> = {}) {
  Object.assign(page as any, { url: new URL(path, "http://localhost"), params });
}

export function resetStores() {
  authToken.set(null);
  authProfile.set(null);
  isAuthLogin.set(false);
  isAuthLoading.set(false);
  courses.set([]);
  course.set(null);
  courseContent.set(null);
  isCoursesLoading.set(false);
  isCourseLoading.set(false);
  isContentLoading.set(false);
  users.set([]);
  isUsersLoading.set(false);
}

export function renderWithProviders(
  Component: any,
  options: { props?: Record<string, any>; setup?: () => void } = {}
) {
  resetStores();
  setPage("/");
  options.setup?.();
  return render(Component, { props: options.props ?? {} });
}

export function childSnippet(text: string) {
  return createRawSnippet(() => ({ render: () => `<p>${text}</p>` }));
}

export async function click(element: Element) {
  (element as HTMLElement).click();
  await tick();
}
