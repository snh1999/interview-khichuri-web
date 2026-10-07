import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { IQuestion } from "@/api/sessions";
import { QuestionCard } from "@/components/prep-session/question/QuestionCard.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";
const SESSION_ID = "11111111-1111-4111-8111-111111111111";

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const QUESTION: IQuestion = {
  answer: "Typed JavaScript",
  createdAt: "2024-01-01",
  id: 1,
  isFavorite: false,
  notes: "Remember generics",
  questionText: "What is TypeScript?",
  sessionId: SESSION_ID,
  updatedAt: "2024-01-01",
};

const renderCard = (
  props: Partial<Parameters<typeof QuestionCard>[0]> = {}
) => {
  const onToggleExpanded = vi.fn();
  const utils = render(
    <Routes>
      <Route
        element={
          <QuestionCard
            expanded={false}
            onToggleExpanded={onToggleExpanded}
            question={QUESTION}
            showNotes={false}
            {...props}
          />
        }
        path="/session/:sessionId"
      />
    </Routes>,
    { route: `/session/${SESSION_ID}` }
  );
  return { ...utils, onToggleExpanded };
};

describe("QuestionCard", () => {
  it("toggles the answer and notes previews", async () => {
    const { user } = renderCard();

    await user.click(screen.getByRole("button", { name: "Answered" }));
    expect(screen.getByText("Typed JavaScript")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Hide answer" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Has notes" }));
    expect(screen.getByText("Remember generics")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Hide notes" })
    ).toBeInTheDocument();
  });

  it("shows the answer and notes when expanded", () => {
    renderCard({ expanded: true, showNotes: true });

    expect(screen.getByText("Typed JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Remember generics")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Answered" })).toBeNull();
  });

  it("requests expansion when the header is clicked", async () => {
    const { user, onToggleExpanded } = renderCard();

    await user.click(
      screen.getByRole("button", { name: "What is TypeScript?" })
    );

    expect(onToggleExpanded).toHaveBeenCalledWith(1);
  });

  it("flips the favourite flag through the update mutation", async () => {
    let body: unknown;
    server.use(
      http.patch(
        `${API}/prep-session/:id/questions/:qid`,
        async ({ request }) => {
          body = await request.json();
          return envelope(QUESTION);
        }
      )
    );
    const { user } = renderCard();

    await user.click(screen.getByRole("button", { name: /pin/i }));

    await waitFor(() => expect(body).toMatchObject({ isFavorite: true }));
  });

  it("opens and cancels the inline edit form", async () => {
    const { user } = renderCard();

    await user.click(screen.getAllByRole("button")[5]);

    expect(await screen.findByText("Cancel")).toBeInTheDocument();
  });
});
