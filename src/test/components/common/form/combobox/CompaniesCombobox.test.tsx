import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { useCallback, useState } from "react";
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

interface IHarnessProps {
  onChange: (companyId: number | null, companyName: string) => void;
}

const Harness = ({ onChange }: Readonly<IHarnessProps>) => {
  const [company, setCompany] = useState<{
    companyId: number | null;
    companyName: string;
  }>({ companyId: null, companyName: "" });

  const handleChange = useCallback(
    (companyId: number | null, companyName: string) => {
      setCompany({ companyId, companyName });
      onChange(companyId, companyName);
    },
    [onChange]
  );

  return (
    <CompaniesCombobox
      companyId={company.companyId}
      companyName={company.companyName}
      onChange={handleChange}
    />
  );
};

describe("CompaniesCombobox", () => {
  it("selects a company from the list", async () => {
    useCompaniesResponse();
    const onChange = vi.fn();
    const view = render(<Harness onChange={onChange} />);

    await view.user.click(await screen.findByRole("combobox"));
    await view.user.click(await screen.findByRole("option", { name: "Acme" }));

    expect(onChange).toHaveBeenCalledWith(1, "Acme");
  });

  it("sets a new company name through the caller", async () => {
    useCompaniesResponse();
    const onChange = vi.fn();
    const view = render(<Harness onChange={onChange} />);
    const input = await screen.findByRole("combobox");

    await view.user.type(input, "Unknown Co");
    await view.user.keyboard("{Enter}");

    expect(onChange).toHaveBeenLastCalledWith(null, "Unknown Co");
    expect(input).toHaveValue("Unknown Co");
  });

  it("commits a typed company name on blur", async () => {
    useCompaniesResponse();
    const onChange = vi.fn();
    const view = render(<Harness onChange={onChange} />);
    const input = await screen.findByRole("combobox");

    await view.user.type(input, "Unknown Co");
    await view.user.tab();

    expect(onChange).toHaveBeenLastCalledWith(null, "Unknown Co");
    expect(input).toHaveValue("Unknown Co");
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
