import { describe, expect, it, vi } from "vitest";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn() }));

import { apiRequest } from "../../../helpers/apiHelper";
import * as api from "./courseApi";

const body = (value: unknown) => value;

describe("courseApi", () => {
  it.each([
    ["getCourses", () => api.getCourses(), ["/courses"]],
    ["getCourse", () => api.getCourse(3), ["/courses/3"]],
    ["postCourse", () => api.postCourse("T", "D"), ["/courses", { method: "POST", body: body({ title: "T", description: "D" }) }]],
    ["putCourse", () => api.putCourse(3, "T", "D"), ["/courses/3", { method: "PUT", body: { title: "T", description: "D" } }]],
    ["deleteCourse", () => api.deleteCourse(3), ["/courses/3", { method: "DELETE" }]],
    ["deleteAllCourses", () => api.deleteAllCourses(), ["/courses", { method: "DELETE" }]],
    ["postStudent", () => api.postStudent(3), ["/courses/3/students", { method: "POST" }]],
    ["deleteStudent", () => api.deleteStudent(3), ["/courses/3/students", { method: "DELETE" }]],
    ["putRating", () => api.putRating(3, 4, "bagus"), ["/courses/3/students/ratings", { method: "PUT", body: { ratings: 4, comment: "bagus" } }]],
    ["postContent", () => api.postContent(3, "T", "https://youtu.be/x"), ["/courses/3/contents", { method: "POST", body: { title: "T", youtube: "https://youtu.be/x" } }]],
    ["putContent", () => api.putContent(11, "T", "https://youtu.be/x"), ["/courses/-/contents/11", { method: "PUT", body: { title: "T", youtube: "https://youtu.be/x" } }]],
    ["getContent", () => api.getContent(11), ["/courses/-/contents/11"]],
    ["deleteContent", () => api.deleteContent(11), ["/courses/-/contents/11", { method: "DELETE" }]],
    ["postContentStatus", () => api.postContentStatus(11, 1), ["/courses/-/contents/11/learns", { method: "POST", body: { status: 1 } }]],
  ])("%s memanggil endpoint yang benar", (_name, run, expected) => {
    run();
    expect(apiRequest).toHaveBeenCalledWith(...(expected as [string, object?]));
  });

  it("postCover mengirim FormData berisi cover", () => {
    api.postCover(3, new File(["x"], "c.png"));
    const [path, options] = vi.mocked(apiRequest).mock.calls[0] as any;
    expect(path).toBe("/courses/3/cover");
    expect(options.method).toBe("POST");
    expect((options.body.get("cover") as File).name).toBe("c.png");
  });
});
