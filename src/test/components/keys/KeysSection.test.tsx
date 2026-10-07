import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import KeysSection from "@/components/keys/KeysSection.tsx";
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
