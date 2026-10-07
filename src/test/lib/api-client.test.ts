import { delay, HttpResponse, http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, streamPost } from "@/lib/api-client.ts";
import { server } from "@/test/msw/server.ts";

const envelope = <T>(data: T) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const ABORT_MESSAGE = /abort/i;

const collect = async <T>(generator: AsyncGenerator<T>): Promise<T[]> => {
  const payloads: T[] = [];
  for await (const payload of generator) {
    payloads.push(payload);
  }
  return payloads;
};

describe("api client", () => {
  it("returns the data from a successful envelope", async () => {
    server.use(http.get("*/api/v1/health", () => envelope({ ok: true })));

    expect(await api.get<{ ok: boolean }>("/health")).toEqual({ ok: true });
  });

  it.each([
    ["post", () => api.post("/things", { name: "a" })],
    ["put", () => api.put("/things", { name: "a" })],
    ["patch", () => api.patch("/things", { name: "a" })],
  ])("sends a %s request with a JSON body", async (method, call) => {
    let seen: {
      method: string;
      body: unknown;
      contentType: string | null;
    } | null = null;
    server.use(
      http.all("*/api/v1/things", async ({ request }) => {
        seen = {
          method: request.method,
          body: await request.json(),
          contentType: request.headers.get("content-type"),
        };
        return envelope(null);
      })
    );

    await call();

    expect(seen).toMatchObject({
      method: method.toUpperCase(),
      body: { name: "a" },
      contentType: expect.stringContaining("application/json"),
    });
  });

  it("sends a delete request without a body", async () => {
    let seenMethod = "";
    server.use(
      http.all("*/api/v1/things/:id", ({ request }) => {
        seenMethod = request.method;
        return envelope(null);
      })
    );

    await api.delete("/things/1");

    expect(seenMethod).toBe("DELETE");
  });

  it("uploads form data without forcing a JSON content type", async () => {
    let contentType = "";
    let fieldName = "";
    server.use(
      http.post("*/api/v1/upload", async ({ request }) => {
        contentType = request.headers.get("content-type") ?? "";
        const body = await request.formData();
        fieldName = String(body.get("file"));
        return envelope(null);
      })
    );

    const form = new FormData();
    form.append("file", "resume.pdf");

    await api.upload("/upload", form);

    expect(contentType).toContain("multipart/form-data");
    expect(fieldName).toBe("resume.pdf");
  });

  it("throws an ApiError carrying the status, message, and field errors", async () => {
    server.use(
      http.post("*/api/v1/things", () =>
        HttpResponse.json(
          {
            data: null,
            message: "Validation failed",
            statusCode: 400,
            errors: [{ path: "name", message: "Name is required" }],
          },
          { status: 400 }
        )
      )
    );

    const error = await api
      .post("/things", {})
      .catch((caught: unknown) => caught as ApiError);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      statusCode: 400,
      message: "Validation failed",
      errors: [{ path: "name", message: "Name is required" }],
    });
  });

  it("falls back to a status message when the error body is not JSON", async () => {
    server.use(
      http.get(
        "*/api/v1/broken",
        () =>
          new HttpResponse("<html>boom</html>", {
            status: 503,
            headers: { "content-type": "text/html" },
          })
      )
    );

    const caught = await api.get("/broken").catch((error: unknown) => error);

    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).message).toBe("Request failed with status 503");
  });

  it("returns undefined when a successful response has no JSON body", async () => {
    server.use(
      http.delete(
        "*/api/v1/things/:id",
        () => new HttpResponse(null, { status: 204 })
      )
    );

    expect(await api.delete("/things/1")).toBeUndefined();
  });

  it("redirects to login on 401 instead of throwing", async () => {
    server.use(
      http.get("*/api/v1/private", () =>
        HttpResponse.json(
          { data: null, message: "Unauthorized", statusCode: 401 },
          { status: 401 }
        )
      )
    );

    // jsdom forbids stubbing `location.href`, so the redirect itself is
    // unobservable — what matters is the promise resolves instead of throwing.
    await expect(api.get("/private")).resolves.toBeUndefined();
  });

  it("aborts the request once timeoutMs elapses", async () => {
    server.use(
      http.get("*/api/v1/slow", async () => {
        await delay(100);
        return envelope("late");
      })
    );

    await expect(api.get("/slow", { timeoutMs: 10 })).rejects.toThrow(
      ABORT_MESSAGE
    );
  });
});

describe("streamPost", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const streamOf = (chunks: string[]): ReadableStream<Uint8Array> =>
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });

  const stubFetch = (response: unknown): ReturnType<typeof vi.fn> => {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  it("yields events split across chunks in order", async () => {
    stubFetch({
      ok: true,
      status: 200,
      body: streamOf(['data: {"n"', ':1}\n\ndata: {"n":2}\n\n']),
    });

    await expect(
      collect(streamPost<{ n: number }>("/stream", { q: "x" }))
    ).resolves.toEqual([{ n: 1 }, { n: 2 }]);
  });

  it("flushes a trailing event that never got its terminator", async () => {
    stubFetch({
      ok: true,
      status: 200,
      body: streamOf(['data: {"n":1}\n\n', 'data: {"n":2}']),
    });

    await expect(
      collect(streamPost<{ n: number }>("/stream"))
    ).resolves.toEqual([{ n: 1 }, { n: 2 }]);
  });

  it("skips events with an empty payload", async () => {
    stubFetch({
      ok: true,
      status: 200,
      body: streamOf(['data:\n\ndata:   \n\ndata: {"ok":true}\n\n']),
    });

    await expect(
      collect(streamPost<{ ok: boolean }>("/stream"))
    ).resolves.toEqual([{ ok: true }]);
  });

  it("posts with JSON headers and credentials", async () => {
    const fetchMock = stubFetch({
      ok: true,
      status: 200,
      body: streamOf([]),
    });

    await collect(streamPost("/stream", { q: "x" }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/stream"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "x" }),
      })
    );
  });

  it("throws an ApiError when the stream request fails", async () => {
    stubFetch({
      ok: false,
      status: 500,
      text: async () =>
        JSON.stringify({
          data: null,
          message: "Upstream down",
          statusCode: 500,
        }),
    });

    await expect(collect(streamPost("/stream"))).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 500,
      message: "Upstream down",
    });
  });

  it("redirects to login on 401 without yielding", async () => {
    stubFetch({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: "Unauthorized" }),
    });

    await expect(collect(streamPost("/stream"))).resolves.toEqual([]);
  });

  it("reports streaming as unsupported when the body is missing", async () => {
    stubFetch({ ok: true, status: 200, body: null });

    await expect(collect(streamPost("/stream"))).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 500,
      message: "Streaming is not supported by this browser",
    });
  });
});
