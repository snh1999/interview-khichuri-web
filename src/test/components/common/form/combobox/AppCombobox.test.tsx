import { describe, expect, it, vi } from "vitest";
import { AppCombobox } from "@/components/common/form/combobox/AppCombobox.tsx";
import { render } from "@/test/render.tsx";

interface IItem {
  id: number;
  name: string;
}

const DATA: IItem[] = [
  { id: 1, name: "React" },
  { id: 2, name: "Vue" },
];

const CREATE_ANGULAR_RE = /Create "Angular"/;

const toOption = (item: IItem) => ({ label: item.name, value: item.id });

describe("AppCombobox", () => {
  it("renders label, description, error and placeholder for a single value", () => {
    const { getByText, getByPlaceholderText } = render(
      <AppCombobox
        data={DATA}
        description="Pick a framework"
        error="Required"
        label="Framework"
        onChange={vi.fn()}
        placeholder="Search..."
        toOption={toOption}
        value={null}
      />
    );

    expect(getByText("Framework")).toBeInTheDocument();
    expect(getByText("Pick a framework")).toBeInTheDocument();
    expect(getByText("Required")).toBeInTheDocument();
    expect(getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("shows the label of a selected single value", () => {
    const { getAllByDisplayValue } = render(
      <AppCombobox
        data={DATA}
        onChange={vi.fn()}
        toOption={toOption}
        value={1}
      />
    );

    expect(getAllByDisplayValue("React").length).toBeGreaterThan(0);
  });

  it("renders inline chips for a multi value", () => {
    const { getByText } = render(
      <AppCombobox
        data={DATA}
        multiple
        onChange={vi.fn()}
        toOption={toOption}
        value={[1, 2]}
      />
    );

    expect(getByText("React")).toBeInTheDocument();
    expect(getByText("Vue")).toBeInTheDocument();
  });

  it("renders below-chips, including extra chips", () => {
    const { getByText } = render(
      <AppCombobox
        chipsBelow
        data={DATA}
        extraChips={["Custom"]}
        multiple
        onChange={vi.fn()}
        onRemoveExtraChip={vi.fn()}
        toOption={toOption}
        value={[1]}
      />
    );

    expect(getByText("React")).toBeInTheDocument();
    expect(getByText("Custom")).toBeInTheDocument();
  });

  it("hides chips in multi mode when requested", () => {
    const { queryByText } = render(
      <AppCombobox
        data={DATA}
        hideChips
        multiple
        onChange={vi.fn()}
        toOption={toOption}
        value={[1]}
      />
    );

    expect(queryByText("React")).not.toBeInTheDocument();
  });

  it("offers a create option and calls onCreateItem", async () => {
    const onCreateItem = vi.fn();
    const { getByRole, findByText, user } = render(
      <AppCombobox
        creatable
        data={DATA}
        onChange={vi.fn()}
        onCreateItem={onCreateItem}
        placeholder="Search..."
        toOption={toOption}
        value={null}
      />
    );

    await user.type(getByRole("combobox"), "Angular");
    await user.click(await findByText(CREATE_ANGULAR_RE));

    expect(onCreateItem).toHaveBeenCalledWith("Angular");
  });

  it("creates and selects values in multi mode", async () => {
    const onCreateItem = vi.fn();
    const onChange = vi.fn();
    const { findByRole, findByText, getByPlaceholderText, user } = render(
      <AppCombobox
        creatable
        data={DATA}
        multiple
        onChange={onChange}
        onCreateItem={onCreateItem}
        placeholder="Add"
        toOption={toOption}
        value={[]}
      />
    );

    await user.type(getByPlaceholderText("Add"), "Angular");
    await user.click(await findByText(CREATE_ANGULAR_RE));

    expect(onCreateItem).toHaveBeenCalledWith("Angular");
    expect(onChange).toHaveBeenCalledWith([]);

    await user.type(getByPlaceholderText("Add"), "Vue");
    await user.click(await findByRole("option", { name: "Vue" }));

    expect(onChange).toHaveBeenCalledWith([2]);
  });
});
