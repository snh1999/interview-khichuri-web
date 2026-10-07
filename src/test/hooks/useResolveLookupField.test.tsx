import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { afterEach, describe, expect, it } from "vitest";
import { Toaster } from "@/components/ui/sonner.tsx";
import { useResolveLookupField } from "@/hooks/useResolveLookupField.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

interface IFormValues {
  roleIds: number[];
  roleNames: string[];
}

const Probe = () => {
  const form = useForm<IFormValues>({
    defaultValues: { roleIds: [1], roleNames: [] },
  });
  const resolve = useResolveLookupField(form, "roles");
  const [resolved, setResolved] = useState<number[] | null | undefined>(null);
  const [draft, setDraft] = useState("");
  const roleIds = form.watch("roleIds");
  const roleNames = form.watch("roleNames");
  const onResolve = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResolved(await resolve("roleIds", "roleNames"));
  };
  const onDraftChange = (event: ChangeEvent<HTMLInputElement>) =>
    setDraft(event.target.value);
  const onAddName = () => {
    form.setValue("roleNames", [...roleNames, draft]);
    setDraft("");
  };

  return (
    <div>
      <form onSubmit={onResolve}>
        <label htmlFor="role-name">New role</label>
        <input id="role-name" onChange={onDraftChange} value={draft} />
        <button onClick={onAddName} type="button">
          Add name
        </button>
        <output>{`ids=${JSON.stringify(roleIds)} names=${JSON.stringify(
          roleNames
        )}`}</output>
        <output>{`resolved=${JSON.stringify(resolved)}`}</output>
        <button type="submit">Resolve</button>
      </form>
      <Toaster />
    </div>
  );
};

const addName = async (
  user: ReturnType<typeof render>["user"],
  name: string
) => {
  await user.type(screen.getByLabelText("New role"), name);
  await user.click(screen.getByRole("button", { name: "Add name" }));
};

describe("useResolveLookupField", () => {
  afterEach(() => {
    toast.dismiss();
  });

  it("returns the existing ids untouched when no names were entered", async () => {
    let posted = false;
    server.use(
      http.post("*/api/v1/lookups/roles/batch", () => {
        posted = true;
        return HttpResponse.json({ data: [], message: "OK", statusCode: 201 });
      })
    );
    const { user } = render(<Probe />);

    await user.click(screen.getByRole("button", { name: "Resolve" }));

    await waitFor(() => {
      expect(screen.getByText("resolved=[1]")).toBeInTheDocument();
    });
    expect(screen.getByText("ids=[1] names=[]")).toBeInTheDocument();
    expect(posted).toBe(false);
  });

  it("creates the lookups, merges the ids, and clears the entered names", async () => {
    let postedNames: unknown = null;
    server.use(
      http.post("*/api/v1/lookups/roles/batch", async ({ request }) => {
        postedNames = ((await request.json()) as { names: unknown }).names;
        return HttpResponse.json(
          { data: [101, 102], message: "Created", statusCode: 201 },
          { status: 201 }
        );
      })
    );
    const { user } = render(<Probe />);
    await addName(user, "Admin");
    await addName(user, "Editor");

    expect(
      screen.getByText('ids=[1] names=["Admin","Editor"]')
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Resolve" }));

    await waitFor(() => {
      expect(screen.getByText("resolved=[1,101,102]")).toBeInTheDocument();
    });
    expect(postedNames).toEqual(["Admin", "Editor"]);
    expect(screen.getByText("ids=[1,101,102] names=[]")).toBeInTheDocument();
  });

  it("keeps the ids and names and shows a toast when creation fails", async () => {
    server.use(
      http.post("*/api/v1/lookups/roles/batch", () =>
        HttpResponse.json(
          { data: null, message: "Database unavailable", statusCode: 500 },
          { status: 500 }
        )
      )
    );
    const { user } = render(<Probe />);
    await addName(user, "Admin");

    await user.click(screen.getByRole("button", { name: "Resolve" }));

    expect(
      await screen.findByText("Failed to add Admin. Please try editing later.")
    ).toBeInTheDocument();
    expect(screen.getByText("resolved=[1]")).toBeInTheDocument();
    expect(screen.getByText('ids=[1] names=["Admin"]')).toBeInTheDocument();
  });
});
