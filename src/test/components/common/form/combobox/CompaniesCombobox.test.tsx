import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { CompaniesCombobox } from "@/components/common/form/combobox/CompaniesCombobox.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const COMPANIES = [
  { id: 1, name: "Acme" },
  { id: 2, name: "Globex" },
];

const useCompaniesResponse = () =>
  server.use(
    http.get("*/api/v1/company", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: COMPANIES })
    )
  );

describe("CompaniesCombobox", () => {
  it("selects a company from the list", async () => {
    useCompaniesResponse();
    const onChange = vi.fn();
    const view = render(
      <CompaniesCombobox companyId={null} companyName="" onChange={onChange} />
    );

    await view.user.click(await screen.findByRole("combobox"));
    await view.user.click(await screen.findByRole("option", { name: "Acme" }));

    expect(onChange).toHaveBeenCalledWith(1, "Acme");
  });

  it("commits typed text on blur, matching a company or keeping free text", async () => {
    useCompaniesResponse();
    const onChange = vi.fn();
    const view = render(
      <CompaniesCombobox companyId={null} companyName="" onChange={onChange} />
    );
    const input = await screen.findByRole("combobox");

    await view.user.click(input);
    await screen.findByRole("option", { name: "Acme" });
    await view.user.keyboard("{Escape}");

    await view.user.clear(input);
    await view.user.type(input, "Globex");
    await view.user.tab();
    expect(onChange).toHaveBeenCalledWith(2, "Globex");

    onChange.mockClear();
    await view.user.clear(input);
    await view.user.type(input, "Unknown Co");
    await view.user.tab();
    expect(onChange).toHaveBeenCalledWith(null, "Unknown Co");
  });

  it("renders a description, omits the label and tolerates unknown ids", async () => {
    useCompaniesResponse();
    render(
      <CompaniesCombobox
        companyId={999}
        companyName=""
        description="Pick one"
        label=""
        onChange={vi.fn()}
      />
    );

    expect(await screen.findByText("Pick one")).toBeInTheDocument();
    expect(screen.queryByText("Company")).not.toBeInTheDocument();
  });
});
