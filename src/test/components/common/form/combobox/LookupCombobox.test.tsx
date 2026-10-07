import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { LookupCombobox } from "@/components/common/form/combobox/LookupCombobox.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const CREATE_CUSTOM_RE = /Create "Custom"/;

const useTopicLookups = () =>
  server.use(
    http.get("*/api/v1/lookups/topics", () =>
      HttpResponse.json({
        statusCode: 200,
        message: "OK",
        data: [
          { id: 1, name: "React" },
          { id: 2, name: "Vue" },
        ],
      })
    )
  );

const Harness = () => {
  const form = useForm<{ topicIds: number[]; topicNames: string[] }>({
    defaultValues: { topicIds: [], topicNames: [] },
  });
  return (
    <div>
      <LookupCombobox form={form} idsName="topicIds" names="topicNames" />
      <span>{`names:${(form.watch("topicNames") ?? []).join(",")}`}</span>
      <span>{`ids:${(form.watch("topicIds") ?? []).join(",")}`}</span>
    </div>
  );
};

describe("LookupCombobox", () => {
  it("adds a typed name to the names field and removes it", async () => {
    useTopicLookups();
    const view = render(<Harness />);

    await view.user.type(await screen.findByRole("combobox"), "Custom");
    await view.user.click(await screen.findByText(CREATE_CUSTOM_RE));
    expect(await screen.findByText("names:Custom")).toBeInTheDocument();

    const chip = screen.getByText("Custom");
    await view.user.click(within(chip).getByRole("button"));
    expect(await screen.findByText("names:")).toBeInTheDocument();
  });

  it("selects an existing lookup value into the ids field", async () => {
    useTopicLookups();
    const view = render(<Harness />);

    await view.user.click(await screen.findByRole("combobox"));
    await view.user.click(await screen.findByRole("option", { name: "React" }));

    expect(await screen.findByText("ids:1")).toBeInTheDocument();
  });
});
