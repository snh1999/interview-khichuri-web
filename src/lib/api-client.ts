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

interface IError {
  path: string;
  message: string;
}

class ApiError extends Error {
  statusCode: number;
  errors?: IError[];

  constructor(statusCode: number, message: string, errors?: IError[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const request = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10_000);

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
        body?.message ?? `Request failed with status ${response.status}`;
      const errors =
        body !== null && "errors" in body
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            (body.errors as IError[])
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
  async get<T>(path: string): Promise<T> {
    return await request<T>(path);
  },
  async post<T>(path: string, data?: unknown): Promise<T> {
    return await request<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  async put<T>(path: string, data?: unknown): Promise<T> {
    return await request<T>(path, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  async patch<T>(path: string, data?: unknown): Promise<T> {
    return await request<T>(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  async delete<T>(path: string): Promise<T> {
    return await request<T>(path, { method: "DELETE" });
  },
  async upload<T>(path: string, formData: FormData): Promise<T> {
    return await request<T>(path, {
      method: "POST",
      body: formData,
    });
  },
};
