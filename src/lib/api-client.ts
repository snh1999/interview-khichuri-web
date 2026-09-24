import { z } from "zod";

const environmentSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: <env file>
  VITE_API_URL: z.url(),
});

const { VITE_API_URL } = environmentSchema.parse(import.meta.env);

const API_PREFIX = new URL("/api/v1", VITE_API_URL).toString();

interface IApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface IApiError {
  path: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: IApiError[];

  constructor(statusCode: number, message: string, errors?: IApiError[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

interface IRequestOptions extends RequestInit {
  timeoutMs?: number;
}

const request = async <T>(
  path: string,
  options: IRequestOptions = {}
): Promise<T> => {
  const timeoutMs = options.timeoutMs ?? 60_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const mergedHeaders = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!(mergedHeaders.has("Content-Type") || isFormData)) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_PREFIX}${path}`, {
      ...options,
      credentials: "include",
      headers: mergedHeaders,
      signal: options.signal ?? controller.signal,
    });
    const rawBody = await response.text();

    let body: IApiResponse<T> | null = null;
    try {
      body = JSON.parse(rawBody) as IApiResponse<T>;
    } catch {
      // response is not JSON
    }

    if (!response.ok) {
      clearTimeout(timeout);
      if (response.status === 401) {
        globalThis.location.href = "/login";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return undefined as T;
      }

      const message =
        body?.message || `Request failed with status ${response.status}`;
      const errors =
        body !== null && "errors" in body
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            (body.errors as IApiError[])
          : undefined;
      throw new ApiError(response.status, message, errors);
    }

    if (body === null) {
      return undefined as T;
    }

    return body.data;
  } finally {
    clearTimeout(timeout);
  }
};

export const api = {
  async get<T>(path: string, options?: IRequestOptions): Promise<T> {
    return await request<T>(path, options);
  },
  async post<T>(
    path: string,
    data?: unknown,
    options?: IRequestOptions
  ): Promise<T> {
    return await request<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },
  async put<T>(
    path: string,
    data?: unknown,
    options?: IRequestOptions
  ): Promise<T> {
    return await request<T>(path, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },
  async patch<T>(
    path: string,
    data?: unknown,
    options?: IRequestOptions
  ): Promise<T> {
    return await request<T>(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },
  async delete<T>(path: string, options?: IRequestOptions): Promise<T> {
    return await request<T>(path, { method: "DELETE", ...options });
  },
  async upload<T>(
    path: string,
    formData: FormData,
    options?: IRequestOptions
  ): Promise<T> {
    return await request<T>(path, {
      method: "POST",
      body: formData,
      ...options,
    });
  },
};

const parseSSEEvent = <T>(event: string): T | null => {
  const dataLine = event
    .replaceAll("\r\n", "\n")
    .split("\n")
    .find((line) => line.startsWith("data:"));
  if (!dataLine) {
    return null;
  }

  const payload = dataLine.slice(5).trim();
  if (!payload) {
    return null;
  }

  return JSON.parse(payload) as T;
};

const extractSSEPayloads = <T>(
  buffer: string
): { payloads: T[]; rest: string } => {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const payloads: T[] = [];
  for (const part of parts) {
    const payload = parseSSEEvent<T>(part);
    if (payload !== null) {
      payloads.push(payload);
    }
  }
  return { payloads, rest };
};

export async function* streamPost<T>(
  path: string,
  data?: unknown,
  signal?: AbortSignal
): AsyncGenerator<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
    signal,
  });

  if (!response.ok) {
    const rawBody = await response.text();
    let body: IApiResponse<T> | null = null;
    try {
      body = JSON.parse(rawBody) as IApiResponse<T>;
    } catch {
      // response is not JSON
    }

    if (response.status === 401) {
      globalThis.location.href = "/login";
      return undefined as T;
    }

    throw new ApiError(
      response.status,
      body?.message || `Request failed with status ${response.status}`
    );
  }

  if (!response.body) {
    throw new ApiError(500, "Streaming is not supported by this browser");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    let done = false;
    while (!done) {
      // biome-ignore lint/performance/noAwaitInLoops: <streaming requires sequential reads>
      const { done: iterationDone, value } = await reader.read();
      done = iterationDone;
      buffer += decoder.decode(value ?? new Uint8Array(), {
        stream: !done,
      });
      const { payloads, rest } = extractSSEPayloads<T>(buffer);
      buffer = rest;
      for (const payload of payloads) {
        yield payload;
      }
    }

    const { payloads } = extractSSEPayloads<T>(buffer);
    for (const payload of payloads) {
      yield payload;
    }
  } finally {
    reader.releaseLock();
  }
}
