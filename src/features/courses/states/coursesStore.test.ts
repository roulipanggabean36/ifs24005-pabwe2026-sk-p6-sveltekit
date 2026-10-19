import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
vi.mock("../api/courseApi");

import Swal from "sweetalert2";
import { fail, makeContent, makeCourse, makeDetail, ok, sampleUser } from "../../../test-utils";
import { authProfile } from "../../auth/states/authStore";
import * as api from "../api/courseApi";
import {
  asyncAddContent,
  asyncAddCourse,
  asyncChangeContent,
  asyncChangeCourse,
  asyncChangeCover,
  asyncDeleteAllCourses,
  asyncDeleteContent,
  asyncDeleteCourse,
  asyncJoinCourse,
  asyncLeaveCourse,
  asyncLoadContent,
  asyncLoadCourse,
  asyncLoadCourses,
  asyncRateCourse,
  asyncSetContentStatus,
  course,
  courseContent,
  courseRole,
  courses,
  getCourseRole,
  isContentLoading,
  isCourseLoading,
  isCoursesLoading,
} from "./coursesStore";

const fire = vi.mocked(Swal.fire);
const file = new File(["x"], "c.png");

describe("coursesStore", () => {
  beforeEach(() => {
    fire.mockResolvedValue({ isConfirmed: true } as never);
    vi.mocked(api.getCourses).mockResolvedValue(ok({ courses: [makeCourse()] }));
    vi.mocked(api.getCourse).mockResolvedValue(ok({ course: makeDetail() }));
    vi.mocked(api.getContent).mockResolvedValue(ok({ course_content: makeContent() }));
    courses.set([]);
    course.set(null);
    courseContent.set(null);
    authProfile.set(null);
  });

  describe("peran pengguna", () => {
    it("getCourseRole membedakan pemilik, peserta, dan tamu", () => {
      expect(getCourseRole({ user_id: 1, students: [] }, 1)).toBe("owner");
      expect(getCourseRole({ user_id: 1, students: [2] }, 2)).toBe("student");
      expect(getCourseRole({ user_id: 1, students: [2] }, 3)).toBe("guest");
    });

    it("pemilik didahulukan bila juga menjadi peserta", () => {
      expect(getCourseRole({ user_id: 1, students: [1] }, 1)).toBe("owner");
    });

    it("courseRole mengikuti kursus dan profil", () => {
      expect(get(courseRole)).toBe("guest");
      authProfile.set(sampleUser);
      course.set(makeDetail({ user_id: 1 }));
      expect(get(courseRole)).toBe("owner");
      course.set(makeDetail({ user_id: 5, students: [1] }));
      expect(get(courseRole)).toBe("student");
      course.set(makeDetail({ user_id: 5, students: [] }));
      expect(get(courseRole)).toBe("guest");
    });
  });

  describe("pemuatan data", () => {
    it("asyncLoadCourses berhasil", async () => {
      await asyncLoadCourses();
      expect(get(courses)).toHaveLength(1);
      expect(get(isCoursesLoading)).toBe(false);
    });

    it("asyncLoadCourses gagal", async () => {
      courses.set([makeCourse()]);
      vi.mocked(api.getCourses).mockResolvedValue(fail("Gagal muat"));
      await asyncLoadCourses();
      expect(get(courses)).toEqual([]);
      expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal muat" }));
    });

    it("asyncLoadCourse berhasil dan gagal", async () => {
      await asyncLoadCourse(3);
      expect(get(course)?.id).toBe(3);
      expect(api.getCourse).toHaveBeenCalledWith(3);
      vi.mocked(api.getCourse).mockResolvedValue(fail());
      await asyncLoadCourse(3);
      expect(get(course)).toBeNull();
      expect(get(isCourseLoading)).toBe(false);
    });

    it("asyncLoadContent berhasil dan gagal", async () => {
      await asyncLoadContent(11);
      expect(get(courseContent)?.id).toBe(11);
      expect(api.getContent).toHaveBeenCalledWith(11);
      vi.mocked(api.getContent).mockResolvedValue(fail());
      await asyncLoadContent(11);
      expect(get(courseContent)).toBeNull();
      expect(get(isContentLoading)).toBe(false);
    });
  });

  describe("mutasi", () => {
    const mutations: [string, () => Promise<boolean>, any, any][] = [
      ["asyncAddCourse", () => asyncAddCourse("T", "D"), api.postCourse, api.getCourses],
      ["asyncChangeCourse", () => asyncChangeCourse(3, "T", "D"), api.putCourse, api.getCourse],
      ["asyncChangeCover", () => asyncChangeCover(3, file), api.postCover, api.getCourse],
      ["asyncDeleteCourse", () => asyncDeleteCourse(3), api.deleteCourse, api.getCourses],
      ["asyncDeleteAllCourses", () => asyncDeleteAllCourses(), api.deleteAllCourses, api.getCourses],
      ["asyncJoinCourse", () => asyncJoinCourse(3), api.postStudent, api.getCourse],
      ["asyncLeaveCourse", () => asyncLeaveCourse(3), api.deleteStudent, api.getCourse],
      ["asyncRateCourse", () => asyncRateCourse(3, 4, "bagus"), api.putRating, api.getCourse],
      ["asyncAddContent", () => asyncAddContent(3, "T", "https://youtu.be/x"), api.postContent, api.getCourse],
      ["asyncChangeContent", () => asyncChangeContent(3, 11, "T", "https://youtu.be/x"), api.putContent, api.getCourse],
      ["asyncDeleteContent", () => asyncDeleteContent(3, 11), api.deleteContent, api.getCourse],
      ["asyncSetContentStatus", () => asyncSetContentStatus(11, 1), api.postContentStatus, api.getContent],
    ];

    it.each(mutations)("%s berhasil dan memuat ulang data", async (_name, run, request, reload) => {
      vi.mocked(request).mockResolvedValue(ok());
      expect(await run()).toBe(true);
      expect(request).toHaveBeenCalledTimes(1);
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it.each(mutations)("%s gagal tanpa memuat ulang", async (_name, run, request, reload) => {
      vi.mocked(request).mockResolvedValue(fail());
      expect(await run()).toBe(false);
      expect(reload).not.toHaveBeenCalled();
    });

    it("meneruskan argumen ke API", async () => {
      vi.mocked(api.postContentStatus).mockResolvedValue(ok());
      await asyncSetContentStatus(11, 0);
      expect(api.postContentStatus).toHaveBeenCalledWith(11, 0);
    });

    it.each([
      ["asyncDeleteCourse", () => asyncDeleteCourse(3), api.deleteCourse],
      ["asyncDeleteAllCourses", () => asyncDeleteAllCourses(), api.deleteAllCourses],
      ["asyncDeleteContent", () => asyncDeleteContent(3, 11), api.deleteContent],
    ])("%s dibatalkan pada dialog konfirmasi", async (_name, run, request) => {
      fire.mockResolvedValueOnce({ isConfirmed: false } as never);
      expect(await run()).toBe(false);
      expect(request).not.toHaveBeenCalled();
    });
  });
});
