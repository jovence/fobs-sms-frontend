import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { studentsService } from "./students.service";

/**
 * The service is now live-only (`studentsService = httpStudentsService`), so these tests drive
 * the HTTP mapper by mocking `global.fetch` to return the backend envelope
 * `{ success, message, data, meta, errors }` and asserting the snake_case → camelCase mapping.
 */

/** Build a fetch mock that resolves one JSON envelope with an optional Content-Disposition. */
function mockFetchOnce(envelope: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 200;
  const res = {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => envelope,
  } as unknown as Response;
  const spy = vi.fn((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    void input;
    void init;
    return Promise.resolve(res);
  });
  vi.stubGlobal("fetch", spy);
  return spy;
}

describe("studentsService (http mapper)", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("maps the paginated index payload (data.students + envelope meta)", async () => {
    const fetchSpy = mockFetchOnce({
      success: true,
      data: {
        students: [
          {
            id: 7,
            matricule: "24S1042",
            full_name: "Awa Nkeng",
            date_of_birth: "2011-03-14",
            place_of_birth: "Bamenda",
            gender: "female",
            registration_status: "approved",
            image: null,
            class_id: 3,
            class: { id: 3, name: "Form 1" },
            created_at: "2025-06-01T00:00:00.000Z",
          },
        ],
        classes: [{ id: 3, name: "Form 1" }],
      },
      meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
    });

    const page = await studentsService.list({ page: 1, perPage: 20 });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(page.total).toBe(1);
    expect(page.page).toBe(1);
    expect(page.perPage).toBe(20);
    expect(page.totalPages).toBe(1);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({
      id: "7",
      matricule: "24S1042",
      fullName: "Awa Nkeng",
      gender: "Female",
      classId: "3",
      className: "Form 1",
      status: "Approved",
    });
  });

  it("passes search/class/status/page as query params", async () => {
    const fetchSpy = mockFetchOnce({
      success: true,
      data: { students: [], classes: [] },
      meta: { current_page: 2, per_page: 20, total: 0, last_page: 1 },
    });

    await studentsService.list({
      page: 2,
      perPage: 20,
      search: "awa",
      classId: "3",
      status: "Approved",
    });

    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain("/dashboard/students?");
    expect(url).toContain("search=awa");
    expect(url).toContain("class_id=3");
    expect(url).toContain("status=Approved");
    expect(url).toContain("page=2");
  });

  it("maps the stats payload", async () => {
    mockFetchOnce({
      success: true,
      data: { total: 86, active: 60, pending: 20, male: 40, female: 46 },
    });

    const stats = await studentsService.stats();
    expect(stats).toEqual({ total: 86, active: 60, pending: 20, male: 40, female: 46 });
  });

  it("maps a created student and POSTs the snake_case payload", async () => {
    const fetchSpy = mockFetchOnce({
      success: true,
      data: {
        id: 12,
        matricule: null,
        full_name: "Test Student",
        date_of_birth: "2010-01-01",
        place_of_birth: "Buea",
        gender: "male",
        registration_status: "pending",
        image: null,
        class_id: 1,
        class: { id: 1, name: "Form 2" },
        created_at: "2026-01-01T00:00:00.000Z",
      },
    });

    const created = await studentsService.create({
      fullName: "Test Student",
      gender: "Male",
      dateOfBirth: "2010-01-01",
      placeOfBirth: "Buea",
      classId: "1",
    });

    expect(created.id).toBe("12");
    expect(created.fullName).toBe("Test Student");
    expect(created.gender).toBe("Male");
    expect(created.status).toBe("Pending");

    const [, reqInit] = fetchSpy.mock.calls[0];
    expect((reqInit as RequestInit).method).toBe("POST");
    const body = JSON.parse(String((reqInit as RequestInit).body));
    expect(body).toMatchObject({
      full_name: "Test Student",
      gender: "male",
      class_id: "1",
      place_of_birth: "Buea",
    });
  });

  it("sends multipart data when a student photo is selected", async () => {
    const fetchSpy = mockFetchOnce({
      success: true,
      data: {
        id: 13,
        matricule: "MAT-13",
        full_name: "Photo Student",
        date_of_birth: "2011-02-02",
        place_of_birth: "Yaounde",
        gender: "female",
        registration_status: "approved",
        image: "student-photos/photo.jpg",
        class_id: 2,
        class: { id: 2, name: "Form 3" },
        created_at: "2026-01-01T00:00:00.000Z",
      },
    });
    const image = new File(["avatar"], "avatar.png", { type: "image/png" });

    await studentsService.create({
      fullName: "Photo Student",
      matricule: "MAT-13",
      gender: "Female",
      dateOfBirth: "2011-02-02",
      placeOfBirth: "Yaounde",
      classId: "2",
      image,
    });

    const [, reqInit] = fetchSpy.mock.calls[0];
    expect((reqInit as RequestInit).method).toBe("POST");
    expect((reqInit as RequestInit).body).toBeInstanceOf(FormData);

    const body = (reqInit as RequestInit).body as FormData;
    expect(body.get("full_name")).toBe("Photo Student");
    expect(body.get("gender")).toBe("female");
    expect(body.get("class_id")).toBe("2");
    expect(body.get("image")).toBe(image);
  });

  it("maps updateStatus via PATCH", async () => {
    const fetchSpy = mockFetchOnce({
      success: true,
      data: {
        id: 12,
        matricule: null,
        full_name: "Test Student",
        date_of_birth: "2010-01-01",
        place_of_birth: "Buea",
        gender: "male",
        registration_status: "approved",
        image: null,
        class_id: 1,
        class: { id: 1, name: "Form 2" },
        created_at: "2026-01-01T00:00:00.000Z",
      },
    });

    const updated = await studentsService.updateStatus("12", "Approved");
    expect(updated.status).toBe("Approved");
    const [url, reqInit] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/dashboard/students/12/status");
    expect((reqInit as RequestInit).method).toBe("PATCH");
  });
});
