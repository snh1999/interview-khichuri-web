import { zodResolver } from "@hookform/resolvers/zod";
import {
  BugDroidIcon,
  BugIcon,
  ChatCircleDotsIcon,
} from "@phosphor-icons/react";
import { type ReactElement, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { FEEDBACK_REPORT_TYPES, useCreateFeedback } from "@/api/feedback.ts";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import FormSelect from "@/components/common/form/FormSelect.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogDescription,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
  DrawLogTrigger,
} from "@/components/ui/custom/DrawLog.tsx";
import { FormDrawLogAlert } from "@/components/ui/custom/FormDrawLogAlert.tsx";

const MAX_MESSAGE_LENGTH = 5000;

const FEEDBACK_TYPE_OPTIONS = [
  { value: "bug", label: "Bug report" },
  { value: "feedback", label: "General feedback" },
] as const;

const feedbackSchema = z.object({
  type: z.enum(FEEDBACK_REPORT_TYPES),
  message: z
    .string()
    .trim()
    .min(10, "Must be at least 10 characters long")
    .max(
      MAX_MESSAGE_LENGTH,
      `Must be at most ${MAX_MESSAGE_LENGTH} characters`
    ),
});

type TFeedbackFormData = z.infer<typeof feedbackSchema>;

const useFeedbackForm = (route: string, onSuccess: () => void) => {
  const { mutateAsync: createFeedback, isPending } = useCreateFeedback();

  const form = useForm<TFeedbackFormData>({
    defaultValues: { type: "bug", message: "" },
    resolver: zodResolver(feedbackSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await createFeedback(
      { ...data, route },
      {
        onSuccess: () => {
          toast.success("Thanks a lot! Your feedback has been recorded!");
          form.reset();
          onSuccess();
        },
      }
    );
  });

  return { form, isLoading: isPending, onSubmit };
};

export const FeedbackDialog = ({
  trigger,
}: Readonly<{ trigger?: ReactElement }>) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = () => setOpen(false);
  const { form, isLoading, onSubmit } = useFeedbackForm(pathname, close);

  const feedbackType = form.watch("type");

  return (
    <FormDrawLogAlert
      isDirty={form.formState.isDirty}
      isLoading={isLoading}
      onOpenChange={setOpen}
      open={open}
      type="feedback"
    >
      <DrawLogTrigger
        render={
          trigger ?? (
            <Button aria-label="Send feedback" size="icon-lg" variant="outline">
              <BugDroidIcon />
            </Button>
          )
        }
      />

      <DrawLogContent>
        <DrawLogHeader>
          <DrawLogTitle className="flex items-center gap-2">
            {feedbackType === "bug" ? (
              <>
                <BugIcon /> Report a bug
              </>
            ) : (
              <>
                <ChatCircleDotsIcon />
                Send feedback
              </>
            )}
          </DrawLogTitle>
          {feedbackType === "bug" ? (
            <DrawLogDescription>
              We&apos;ll include the page you&apos;re on ({pathname}) with your
              message.
            </DrawLogDescription>
          ) : null}
        </DrawLogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <DrawLogBody>
            <FormSelect
              clearable={false}
              form={form}
              label="Type"
              name="type"
              placeholder="Select a type"
              selectData={FEEDBACK_TYPE_OPTIONS}
            />
            <FormInput
              form={form}
              label="Message"
              name="message"
              placeholder="What went wrong, or what would you improve?"
              rows={6}
              textArea
            />
          </DrawLogBody>

          <DrawLogFooter>
            <DrawLogClose render={<Button variant="outline">Cancel</Button>} />
            <AsyncButton isLoading={isLoading} type="submit">
              Send
            </AsyncButton>
          </DrawLogFooter>
        </form>
      </DrawLogContent>
    </FormDrawLogAlert>
  );
};
