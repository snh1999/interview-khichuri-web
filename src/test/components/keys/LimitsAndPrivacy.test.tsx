import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LimitsAndPrivacy } from "@/components/keys/info/LimitsAndPrivacy.tsx";
import {
  type IProviderInfo,
  PROVIDER_INFO,
} from "@/components/keys/info/provider.data.ts";
import { render } from "@/test/render.tsx";

const info = (overrides: Partial<IProviderInfo> = {}): IProviderInfo => ({
  benchmarkUrl: "https://example.com/benchmarks",
  cons: [],
  freeTier: "Free tier.",
  freeTierLimits: {
    contextWindow: 1000,
    notes: "Limits vary by model.",
    rpd: 100,
    rpm: 10,
    tpm: 2000,
  },
  getApiKeySteps: [],
  getApiKeyUrl: "https://example.com/key",
  name: "Example",
  privacyNote: "Prompts are not used for training.",
  privacyPolicyUrl: "https://example.com/privacy",
  pros: [],
  ...overrides,
});

const open = async (user: ReturnType<typeof render>["user"]) => {
  await user.click(screen.getByRole("button", { name: "Limits & Privacy" }));
};

describe("LimitsAndPrivacy", () => {
  it("renders privacy notes, limits and provider links", async () => {
    const { user } = render(<LimitsAndPrivacy info={PROVIDER_INFO.google} />);
    await open(user);

    expect(
      screen.getByText(PROVIDER_INFO.google.privacyNote)
    ).toBeInTheDocument();
    expect(screen.getByText("Request")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("2K")).toBeInTheDocument();
    expect(screen.getByText("Token")).toBeInTheDocument();
    expect(screen.getByText("Context")).toBeInTheDocument();
    expect(screen.getAllByText("1M")).toHaveLength(2);
    expect(
      screen.getByText(PROVIDER_INFO.google.freeTierLimits.notes)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Privacy Policy" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Benchmarks" })
    ).toBeInTheDocument();
  });

  it("hides empty limits and missing links", async () => {
    const { user } = render(
      <LimitsAndPrivacy
        info={info({
          benchmarkUrl: undefined,
          freeTierLimits: {
            contextWindow: 0,
            notes: "",
            rpd: 0,
            rpm: 0,
            tpm: 0,
          },
          privacyPolicyUrl: undefined,
        })}
      />
    );
    await open(user);

    expect(screen.queryByText("Request")).not.toBeInTheDocument();
    expect(screen.queryByText("Token")).not.toBeInTheDocument();
    expect(screen.queryByText("Context")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Privacy Policy" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Benchmarks" })
    ).not.toBeInTheDocument();
  });

  it("formats large limits and skips empty free-tier sentences", async () => {
    const { user } = render(
      <LimitsAndPrivacy
        info={info({
          freeTier: "First..Second.",
          freeTierLimits: {
            contextWindow: 2_000_000,
            notes: "",
            rpd: 2500,
            rpm: 999,
            tpm: undefined,
          },
        })}
      />
    );
    await open(user);

    expect(screen.getByText("999")).toBeInTheDocument();
    expect(screen.getByText("3K")).toBeInTheDocument();
    expect(screen.getByText("2M")).toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
