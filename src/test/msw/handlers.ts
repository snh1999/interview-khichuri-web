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
  http.get(`${API}/profile`, () =>
    envelope({
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      workOverviews: [{ title: "Engineer" }],
    })
  ),

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

  http.post(`${API}/portfolio/builder`, async ({ request }) => {
    const body = (await request.json()) as {
      files: Record<string, string>;
    };
    return envelope({
      files: body.files,
      message: "Mocked builder reply",
      applied: [],
    });
  }),

  http.post(`${API}/portfolio/sketch`, async ({ request }) => {
    const body = (await request.json()) as {
      frames: { route?: string }[];
    };
    const routes = [...new Set(body.frames.map((f) => f.route || "/"))];
    return envelope({
      id: "design-1",
      routes,
      createdAt: new Date().toISOString(),
      prompt: "",
      themeUsed: {},
      wireframeSummary: { elementCount: 0, detectedLayout: "", sections: [] },
      files: {
        "/App.js": "export default function App() { return null; }",
        ...Object.fromEntries(
          routes.map((route, i) => [`/Page${i}.js`, `// ${route}`])
        ),
      },
      previewType: "interactive",
    });
  }),

  http.post(`${API}/portfolio/generate`, () => {
    const app = "export default function App() { return null; }";
    const frames = [
      { type: "plan", files: [{ path: "/App.js", description: "Root" }] },
      { type: "file-start", path: "/App.js" },
      { type: "file-complete", path: "/App.js", content: app },
      {
        type: "finish",
        files: { "/App.js": app },
        message: "Generated 1 file",
        failed: [],
      },
    ];
    return new HttpResponse(
      frames.map((frame) => `data: ${JSON.stringify(frame)}\n\n`).join(""),
      { headers: { "Content-Type": "text/event-stream" } }
    );
  }),
];
