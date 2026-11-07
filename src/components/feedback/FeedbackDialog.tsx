import { zodResolver } from "@hookform/resolvers/zod";
import {
  BugDroidIcon,
  BugIcon,
  BuildingsIcon,
  ChatCircleDotsIcon,
} from "@phosphor-icons/react";
import { type ReactElement, type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import {
  FEEDBACK_REPORT_TYPES,
  type TFeedbackReportType,
  useCreateFeedback,
} from "@/api/feedback.ts";
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

const HEADER: Record<
  TFeedbackReportType,
  { icon: ReactNode; title: string; description?: string }
> = {
  bug: {
    icon: <BugIcon />,
    title: "Report a bug",
    description: `We'll include the page you're on with your message. \n
       Please report from the specific page or mention the page name in your message`,
  },
  // biome-ignore lint/style/useNamingConvention: feedback type is snake_case on the API
  company_request: {
    icon: <BuildingsIcon />,
    title: "Request a company",
    description:
      "Add the company name, career page and website so we can review it.",
  },
  feedback: {
    icon: <ChatCircleDotsIcon />,
    title: "Send feedback",
  },
};

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

const useFeedbackForm = (
  route: string,
  onSuccess: () => void,
  initialType: TFeedbackReportType,
  initialMessage: string
) => {
  const { mutateAsync: createFeedback, isPending } = useCreateFeedback();

  const form = useForm<TFeedbackFormData>({
    defaultValues: { type: initialType, message: initialMessage },
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
  initialType = "bug",
  initialMessage = "",
  hideType = false,
}: Readonly<{
  trigger?: ReactElement;
  initialType?: TFeedbackReportType;
  initialMessage?: string;
  hideType?: boolean;
}>) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = () => setOpen(false);
  const { form, isLoading, onSubmit } = useFeedbackForm(
    pathname,
    close,
    initialType,
    initialMessage
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen || isLoading) {
      setOpen(nextOpen);
      return;
    }
    form.reset();
    setOpen(false);
  };

  const feedbackType = form.watch("type");
  const { icon, title, description } = HEADER[feedbackType];

  return (
    <FormDrawLogAlert
      isDirty={form.formState.isDirty}
      isLoading={isLoading}
      onOpenChange={handleOpenChange}
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
            {icon} {title}
          </DrawLogTitle>
          <DrawLogDescription>{description}</DrawLogDescription>
        </DrawLogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <DrawLogBody>
            {hideType ? null : (
              <FormSelect
                clearable={false}
                form={form}
                label="Type"
                name="type"
                placeholder="Select a type"
                selectData={FEEDBACK_TYPE_OPTIONS}
              />
            )}
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
