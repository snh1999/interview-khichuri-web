import { fireEvent, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { FormDatePicker } from "@/components/common/form/FormDatePicker.tsx";
import { render } from "@/test/render.tsx";

interface IValues {
  value: Date | null | undefined;
}

const PRESERVED_TIME_RE = /T\d{2}:30:00\.000Z$/;

interface IHarnessProps {
  defaultValues?: IValues;
  withTime?: boolean;
}

const Harness = ({ defaultValues, withTime }: IHarnessProps) => {
  const form = useForm<IValues>({ defaultValues });
  const current = form.watch("value");
  return (
    <div>
      <FormDatePicker
        description="Pick the date"
        form={form}
        label="Start date"
        name="value"
        placeholder="Pick a date"
        withTime={withTime}
      />
      <output>
        {current instanceof Date ? current.toISOString() : String(current)}
      </output>
    </div>
  );
};

describe("FormDatePicker", () => {
  it("writes a typed date into the form", async () => {
    const view = render(<Harness />);
    await view.user.type(screen.getByLabelText("Start date"), "2024-05-01");
    expect(screen.getByText("2024-05-01T00:00:00.000Z")).toBeInTheDocument();
  });

  it("clears the value from the clear button", async () => {
    const view = render(
      <Harness defaultValues={{ value: new Date("2024-05-01T00:00:00Z") }} />
    );
    await view.user.click(screen.getByLabelText("Clear date"));
    expect(screen.getByText("null")).toBeInTheDocument();
  });

  it("updates the time and preserves the date", () => {
    render(<Harness withTime />);
    const timeInput = document.querySelector(
      'input[type="time"]'
    ) as HTMLInputElement;
    fireEvent.change(timeInput, { target: { value: "14:45" } });
    const expected = new Date();
    expected.setHours(14, 45, 0, 0);
    expect(screen.getByText(expected.toISOString())).toBeInTheDocument();

    fireEvent.change(timeInput, { target: { value: "" } });
    expect(screen.getByText("undefined")).toBeInTheDocument();
  });

  it("keeps the existing time when a new date is picked", () => {
    render(
      <Harness
        defaultValues={{ value: new Date("2024-05-01T09:30:00") }}
        withTime
      />
    );
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2024-06-01" },
    });
    expect(screen.getByRole("status")).toHaveTextContent(PRESERVED_TIME_RE);
  });

  it("shows a validation error when the field is invalid", () => {
    const InvalidHarness = () => {
      const form = useForm<IValues>({ defaultValues: { value: null } });
      form.setError("value", { type: "manual", message: "Date is required" });
      return (
        <FormDatePicker form={form} name="value" placeholder="Pick a date" />
      );
    };
    render(<InvalidHarness />);
    expect(screen.getByText("Date is required")).toBeInTheDocument();
  });
});
