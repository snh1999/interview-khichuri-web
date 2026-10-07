import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { TopicsAppCombobox } from "@/components/common/form/combobox/TopicsAppCombobox.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const TOPICS = [
  { id: 1, name: "React" },
  { id: 2, name: "Vue" },
];

const useTopicsResponse = () =>
  server.use(
    http.get("*/api/v1/lookups/topics", () =>
      HttpResponse.json({ statusCode: 200, message: "OK", data: TOPICS })
    )
  );

describe("TopicsAppCombobox", () => {
  it("emits the preselected topic names", async () => {
    useTopicsResponse();
    const onValueChange = vi.fn();
    render(
      <TopicsAppCombobox onValueChange={onValueChange} sessionTopicIds={[1]} />
    );

    await screen.findByRole("combobox");
    expect(onValueChange).toHaveBeenCalledWith(["React"]);
  });

  it("emits the updated names when another topic is selected", async () => {
    useTopicsResponse();
    const onValueChange = vi.fn();
    const view = render(
      <TopicsAppCombobox onValueChange={onValueChange} sessionTopicIds={[1]} />
    );

    await view.user.click(await screen.findByRole("combobox"));
    await view.user.click(await screen.findByRole("option", { name: "Vue" }));

    expect(onValueChange).toHaveBeenCalledWith(["React", "Vue"]);
  });
});
