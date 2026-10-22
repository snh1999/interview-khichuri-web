import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import KeysSection from "@/components/keys/KeysSection.tsx";
import { mockApiKey } from "@/test/msw/handlers.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

describe("KeysSection", () => {
  it("renders saved keys grouped by provider", async () => {
    render(<KeysSection />);

    expect(await screen.findByText("My Gemini key")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("shows the empty state when no keys are saved", async () => {
    server.use(
      http.get("*/api/v1/ai/api-keys", () =>
        HttpResponse.json({ data: [], message: "OK", statusCode: 200 })
      )
    );
    render(<KeysSection />);

    expect(await screen.findByText("No API keys")).toBeInTheDocument();
  });

  it("requires an HTTPS base URL when editing a custom key", async () => {
    let patched = false;
    server.use(
      http.get("*/api/v1/ai/api-keys", () =>
        HttpResponse.json({
          data: [
            {
              ...mockApiKey,
              baseUrl: "https://api.example.com/v1",
              provider: "custom",
            },
          ],
          message: "OK",
          statusCode: 200,
        })
      ),
      http.patch("*/api/v1/ai/api-keys/:id", () => {
        patched = true;
        return HttpResponse.json({
          data: null,
          message: "OK",
          statusCode: 200,
        });
      })
    );
    const { user } = render(<KeysSection />);

    await user.click(await screen.findByRole("button", { name: "Edit key" }));
    const baseUrl = screen.getByLabelText("Base URL");

    await user.clear(baseUrl);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(
      await screen.findByText("Base URL is required for this provider")
    ).toBeInTheDocument();

    await user.type(baseUrl, "http://api.example.com");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(
      await screen.findByText("Base URL must use HTTPS")
    ).toBeInTheDocument();
    expect(patched).toBe(false);
  });

  it("saves a custom key with a valid HTTPS base URL", async () => {
    let patched: Record<string, unknown> | null = null;
    server.use(
      http.get("*/api/v1/ai/api-keys", () =>
        HttpResponse.json({
          data: [
            {
              ...mockApiKey,
              baseUrl: "https://api.example.com/v1",
              provider: "custom",
            },
          ],
          message: "OK",
          statusCode: 200,
        })
      ),
      http.patch("*/api/v1/ai/api-keys/:id", async ({ request }) => {
        patched = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: null,
          message: "OK",
          statusCode: 200,
        });
      })
    );
    const { user } = render(<KeysSection />);

    await user.click(await screen.findByRole("button", { name: "Edit key" }));
    const baseUrl = screen.getByLabelText("Base URL");
    await user.clear(baseUrl);
    await user.type(baseUrl, "https://new.example.com/v1");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(patched).toMatchObject({ baseUrl: "https://new.example.com/v1" });
    });
    await waitFor(() => {
      expect(screen.queryByLabelText("Base URL")).not.toBeInTheDocument();
    });
  });

  it("edits a non-custom key without validating the hidden base URL", async () => {
    let patched: Record<string, unknown> | null = null;
    server.use(
      http.get("*/api/v1/ai/api-keys", () =>
        HttpResponse.json({
          data: [{ ...mockApiKey, baseUrl: "http://legacy.example.com" }],
          message: "OK",
          statusCode: 200,
        })
      ),
      http.patch("*/api/v1/ai/api-keys/:id", async ({ request }) => {
        patched = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: null,
          message: "OK",
          statusCode: 200,
        });
      })
    );
    const { user } = render(<KeysSection />);

    await user.click(await screen.findByRole("button", { name: "Edit key" }));
    const name = screen.getByLabelText("Name");
    await user.clear(name);
    await user.type(name, "Renamed key");
    expect(screen.queryByLabelText("Base URL")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(patched).toEqual({
        model: "gemini-2.0-flash",
        name: "Renamed key",
      });
    });
    await waitFor(() => {
      expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    });
  });

  it("shows the error card when loading fails", async () => {
    server.use(
      http.get("*/api/v1/ai/api-keys", () =>
        HttpResponse.json(
          { data: null, message: "Database unavailable", statusCode: 500 },
          { status: 500 }
        )
      )
    );
    render(<KeysSection />);

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Database unavailable")).toBeInTheDocument();
  });
});
