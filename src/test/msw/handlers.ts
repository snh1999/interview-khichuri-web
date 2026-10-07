import { HttpResponse, http } from "msw";
import type { IApiKey } from "@/api/keys/index.ts";

const API = "*/api/v1";

const envelope = <T>(data: T, statusCode = 200, message = "OK") =>
  HttpResponse.json({ data, message, statusCode }, { status: statusCode });

export const mockApiKey: IApiKey = {
  createdAt: new Date("2026-01-01").toISOString(),
  id: "key-1",
  isActive: true,
  model: "gemini-2.0-flash",
  name: "My Gemini key",
  provider: "google",
  updatedAt: new Date("2026-01-01").toISOString(),
  userId: "user-1",
};

export const handlers = [
  http.get(`${API}/ai/api-keys`, () => envelope([mockApiKey])),

  http.post(`${API}/ai/api-keys`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return envelope(
      {
        ...body,
        createdAt: new Date().toISOString(),
        id: "key-new",
        updatedAt: new Date().toISOString(),
        userId: "user-1",
      },
      201,
      "Created"
    );
  }),

  http.patch(`${API}/ai/api-keys/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return envelope({ ...mockApiKey, ...body, id: params.id });
  }),

  http.patch(`${API}/ai/api-keys/:id/activate`, () => envelope(null)),

  http.delete(`${API}/ai/api-keys/:id`, () => envelope(null)),
];
