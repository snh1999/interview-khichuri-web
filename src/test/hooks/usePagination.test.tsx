import { screen } from "@testing-library/react";
import { useSearchParams } from "react-router";
import { describe, expect, it } from "vitest";
import { usePagination } from "@/hooks/usePagination.ts";
import { render } from "@/test/render.tsx";

const PaginationProbe = ({ defaultLimit }: { defaultLimit?: number }) => {
  const { page, limit, setPage, setLimit } = usePagination(defaultLimit);
  const [searchParameters] = useSearchParams();
  const goFirst = () => setPage(0);
  const goThird = () => setPage(3);
  const goFifty = () => setLimit(50);

  return (
    <div>
      <output>{`page=${page} limit=${limit}`}</output>
      <p>{`query=${searchParameters.toString()}`}</p>
      <button onClick={goFirst} type="button">
        First
      </button>
      <button onClick={goThird} type="button">
        Third
      </button>
      <button onClick={goFifty} type="button">
        Fifty
      </button>
    </div>
  );
};

describe("usePagination", () => {
  it("defaults to page 1 and limit 10 when the URL has no params", () => {
    render(<PaginationProbe />);

    expect(screen.getByText("page=1 limit=10")).toBeInTheDocument();
    expect(screen.getByText("query=")).toBeInTheDocument();
  });

  it("honours a provided default limit", () => {
    render(<PaginationProbe defaultLimit={25} />);

    expect(screen.getByText("page=1 limit=25")).toBeInTheDocument();
  });

  it("reads the page and limit from the URL", () => {
    render(<PaginationProbe />, { route: "/?page=3&limit=25" });

    expect(screen.getByText("page=3 limit=25")).toBeInTheDocument();
  });

  it("falls back to page 1 when the param is not a number", () => {
    render(<PaginationProbe />, { route: "/?page=abc" });

    expect(screen.getByText("page=1 limit=10")).toBeInTheDocument();
  });

  it("clamps the page to at least 1", async () => {
    const { user } = render(<PaginationProbe />, { route: "/?page=5" });

    await user.click(screen.getByRole("button", { name: "First" }));

    expect(screen.getByText("page=1 limit=10")).toBeInTheDocument();
    expect(screen.getByText("query=page=1")).toBeInTheDocument();
  });

  it("resets to page 1 whenever the limit changes", async () => {
    const { user } = render(<PaginationProbe />, { route: "/?page=3" });

    await user.click(screen.getByRole("button", { name: "Fifty" }));

    expect(screen.getByText("page=1 limit=50")).toBeInTheDocument();
    expect(screen.getByText("query=page=1&limit=50")).toBeInTheDocument();
  });
});
