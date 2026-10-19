import { apiRequest } from "../../../helpers/apiHelper";

export type Id = number | string;

export type Course = {
  id: number;
  user_id: number;
  title: string;
  cover: string | null;
  description: string;
  created_at?: string;
  updated_at?: string;
  author: { name: string; photo: string };
  students: number[];
  total_contents: number;
  avg_ratings: string | null;
};

export type CourseContent = {
  id: number;
  course_id: number;
  title: string;
  youtube: string;
  my_status_finished: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CourseRating = { name: string; ratings: number; comment: string };

export type CourseDetail = Course & {
  contents: CourseContent[];
  ratings: CourseRating[];
  my_percentage_finished: string;
};

export const getCourses = () => apiRequest<{ courses: Course[] }>("/courses");

export const getCourse = (id: Id) => apiRequest<{ course: CourseDetail }>(`/courses/${id}`);

export const postCourse = (title: string, description: string) =>
  apiRequest("/courses", { method: "POST", body: { title, description } });

export const postCover = (id: Id, file: File) => {
  const form = new FormData();
  form.append("cover", file);
  return apiRequest(`/courses/${id}/cover`, { method: "POST", body: form });
};

export const putCourse = (id: Id, title: string, description: string) =>
  apiRequest(`/courses/${id}`, { method: "PUT", body: { title, description } });

export const deleteCourse = (id: Id) => apiRequest(`/courses/${id}`, { method: "DELETE" });

export const deleteAllCourses = () => apiRequest("/courses", { method: "DELETE" });

export const postStudent = (id: Id) => apiRequest(`/courses/${id}/students`, { method: "POST" });

export const deleteStudent = (id: Id) =>
  apiRequest(`/courses/${id}/students`, { method: "DELETE" });

export const putRating = (id: Id, ratings: number, comment: string) =>
  apiRequest(`/courses/${id}/students/ratings`, {
    method: "PUT",
    body: { ratings, comment },
  });

export const postContent = (courseId: Id, title: string, youtube: string) =>
  apiRequest(`/courses/${courseId}/contents`, { method: "POST", body: { title, youtube } });

export const putContent = (contentId: Id, title: string, youtube: string) =>
  apiRequest(`/courses/-/contents/${contentId}`, { method: "PUT", body: { title, youtube } });

export const getContent = (contentId: Id) =>
  apiRequest<{ course_content: CourseContent }>(`/courses/-/contents/${contentId}`);

export const deleteContent = (contentId: Id) =>
  apiRequest(`/courses/-/contents/${contentId}`, { method: "DELETE" });

export const postContentStatus = (contentId: Id, status: 0 | 1) =>
  apiRequest(`/courses/-/contents/${contentId}/learns`, { method: "POST", body: { status } });
