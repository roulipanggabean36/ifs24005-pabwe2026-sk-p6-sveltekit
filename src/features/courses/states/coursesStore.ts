import { derived, writable, type Writable } from "svelte/store";
import type { ApiResult } from "../../../helpers/apiHelper";
import {
  runMutation,
  showConfirmDialog,
  showErrorDialog,
} from "../../../helpers/toolsHelper";
import { profileId } from "../../auth/states/authStore";
import * as api from "../api/courseApi";
import type { Course, CourseContent, CourseDetail, Id } from "../api/courseApi";

export type CourseRole = "owner" | "student" | "guest";

export const courses = writable<Course[]>([]);
export const course = writable<CourseDetail | null>(null);
export const courseContent = writable<CourseContent | null>(null);

export const isCoursesLoading = writable(false);
export const isCourseLoading = writable(false);
export const isContentLoading = writable(false);

export const isMutatingCourse = writable(false);
export const isMutatingCover = writable(false);
export const isMutatingStudent = writable(false);
export const isMutatingRating = writable(false);
export const isMutatingContent = writable(false);

export function getCourseRole(
  target: Pick<Course, "user_id" | "students">,
  userId: number
): CourseRole {
  if (target.user_id === userId) return "owner";
  if (target.students.includes(userId)) return "student";
  return "guest";
}

export const courseRole = derived([course, profileId], ([current, id]) =>
  current ? getCourseRole(current, id) : "guest"
);

async function load<T>(
  flag: Writable<boolean>,
  request: () => Promise<ApiResult<T>>,
  onSuccess: (data: T) => void,
  onFail: () => void
): Promise<void> {
  flag.set(true);
  const result = await request();
  if (result.success) {
    onSuccess(result.data);
  } else {
    onFail();
    await showErrorDialog(result.message);
  }
  flag.set(false);
}

export const asyncLoadCourses = () =>
  load(isCoursesLoading, api.getCourses, (data) => courses.set(data.courses), () => courses.set([]));

export const asyncLoadCourse = (id: Id) =>
  load(isCourseLoading, () => api.getCourse(id), (data) => course.set(data.course), () => course.set(null));

export const asyncLoadContent = (contentId: Id) =>
  load(
    isContentLoading,
    () => api.getContent(contentId),
    (data) => courseContent.set(data.course_content),
    () => courseContent.set(null)
  );

export const asyncAddCourse = (title: string, description: string) =>
  runMutation(isMutatingCourse, () => api.postCourse(title, description), asyncLoadCourses);

export const asyncChangeCourse = (id: Id, title: string, description: string) =>
  runMutation(isMutatingCourse, () => api.putCourse(id, title, description), () => asyncLoadCourse(id));

export const asyncChangeCover = (id: Id, file: File) =>
  runMutation(isMutatingCover, () => api.postCover(id, file), () => asyncLoadCourse(id));

export async function asyncDeleteCourse(id: Id): Promise<boolean> {
  if (!(await showConfirmDialog("Hapus kursus", "Kursus dan seluruh kontennya akan dihapus permanen."))) {
    return false;
  }
  return runMutation(isMutatingCourse, () => api.deleteCourse(id), asyncLoadCourses);
}

export async function asyncDeleteAllCourses(): Promise<boolean> {
  if (!(await showConfirmDialog("Hapus semua kursus", "Semua kursus milik Anda akan dihapus permanen."))) {
    return false;
  }
  return runMutation(isMutatingCourse, () => api.deleteAllCourses(), asyncLoadCourses);
}

export const asyncJoinCourse = (id: Id) =>
  runMutation(isMutatingStudent, () => api.postStudent(id), () => asyncLoadCourse(id));

export const asyncLeaveCourse = (id: Id) =>
  runMutation(isMutatingStudent, () => api.deleteStudent(id), () => asyncLoadCourse(id));

export const asyncRateCourse = (id: Id, ratings: number, comment: string) =>
  runMutation(isMutatingRating, () => api.putRating(id, ratings, comment), () => asyncLoadCourse(id));

export const asyncAddContent = (courseId: Id, title: string, youtube: string) =>
  runMutation(isMutatingContent, () => api.postContent(courseId, title, youtube), () => asyncLoadCourse(courseId));

export const asyncChangeContent = (courseId: Id, contentId: Id, title: string, youtube: string) =>
  runMutation(isMutatingContent, () => api.putContent(contentId, title, youtube), () => asyncLoadCourse(courseId));

export async function asyncDeleteContent(courseId: Id, contentId: Id): Promise<boolean> {
  if (!(await showConfirmDialog("Hapus konten", "Konten ini akan dihapus permanen."))) {
    return false;
  }
  return runMutation(isMutatingContent, () => api.deleteContent(contentId), () => asyncLoadCourse(courseId));
}

export const asyncSetContentStatus = (contentId: Id, status: 0 | 1) =>
  runMutation(isMutatingContent, () => api.postContentStatus(contentId, status), () => asyncLoadContent(contentId));
