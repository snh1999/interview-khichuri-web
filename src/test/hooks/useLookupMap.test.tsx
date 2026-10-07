import { useQueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { queryKeys } from "@/api";
import type { ILookupEntry } from "@/api/lookups";
import {
  useIndustryMap,
  useRolesMap,
  useTopicsMap,
} from "@/hooks/useLookupMap.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const lookupHandler = (schema: string, entries: ILookupEntry[]) =>
  http.get(`*/api/v1/lookups/${schema}`, () =>
    HttpResponse.json({ data: entries, message: "OK", statusCode: 200 })
  );

const TOPICS: ILookupEntry[] = [
  { id: 1, name: "System Design", isApproved: true },
  { id: 2, name: "Algorithms", isApproved: true },
];

let captured: Map<number, ILookupEntry>[];

const TopicProbe = () => {
  const map = useTopicsMap();
  captured.push(map);
  return <p>{`topic=${map.get(2)?.name ?? "missing"}`}</p>;
};

const RefreshProbe = () => {
  const queryClient = useQueryClient();
  const map = useTopicsMap();
  captured.push(map);
  const refresh = () =>
    queryClient.setQueryData(queryKeys.lookups.topics, [
      { id: 3, name: "Refetched", isApproved: true },
    ]);
  return (
    <div>
      <p>{`topic=${map.get(2)?.name ?? "missing"} refetched=${
        map.get(3)?.name ?? "missing"
      }`}</p>
      <button onClick={refresh} type="button">
        Refresh
      </button>
    </div>
  );
};

const OtherMapsProbe = () => {
  const industries = useIndustryMap();
  const roles = useRolesMap();
  return (
    <p>{`industry=${industries.get(5)?.name ?? "missing"} role=${
      roles.get(9)?.name ?? "missing"
    }`}</p>
  );
};

describe("lookup maps", () => {
  beforeEach(() => {
    captured = [];
  });

  it("resolves a lookup entry by id", async () => {
    server.use(lookupHandler("topics", TOPICS));

    render(<TopicProbe />);

    expect(await screen.findByText("topic=Algorithms")).toBeInTheDocument();
    expect(captured[0]?.get(1)?.name).toBe("System Design");
  });

  it("returns the same map for the same data across renders", async () => {
    server.use(lookupHandler("topics", TOPICS));

    const { rerender } = render(<TopicProbe />);
    await screen.findByText("topic=Algorithms");

    rerender(<TopicProbe />);

    expect(captured.at(-1)).toBe(captured.at(-2));
  });

  it("builds a fresh map when the underlying data changes", async () => {
    server.use(lookupHandler("topics", TOPICS));
    const { user } = render(<RefreshProbe />);
    await screen.findByText("topic=Algorithms refetched=missing");

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(
      await screen.findByText("topic=missing refetched=Refetched")
    ).toBeInTheDocument();
    expect(captured.at(-1)).not.toBe(captured.at(-2));
  });

  it("maps industries and roles through their own queries", async () => {
    server.use(
      lookupHandler("industries", [
        { id: 5, name: "Fintech", isApproved: true },
      ]),
      lookupHandler("roles", [
        { id: 9, name: "Staff Engineer", isApproved: true },
      ])
    );

    render(<OtherMapsProbe />);

    expect(
      await screen.findByText("industry=Fintech role=Staff Engineer")
    ).toBeInTheDocument();
  });
});
