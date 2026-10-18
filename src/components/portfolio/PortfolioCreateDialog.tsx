import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCreatePortfolio } from "@/api/portfolio/idb.ts";
import { useProfileQuery } from "@/api/profile/profiles.ts";
import {
  DEFAULT_MAX_STRING_LENGTH,
  MAX_SHORT_LENGTH,
} from "@/app.constants.ts";
import { FormCheckbox } from "@/components/common/form/FormCheckbox.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DrawLog,
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogDescription,
  DrawLogFooter,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog.tsx";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
}

const portfolioSchema = z.object({
  description: z.string().max(DEFAULT_MAX_STRING_LENGTH),
  startFromTemplate: z.boolean(),
  title: z
    .string()
    .trim()
    .min(2, "Title too short")
    .max(
      MAX_SHORT_LENGTH,
      `Keep the title under ${MAX_SHORT_LENGTH} characters`
    ),
});

type TPortfolioFormData = z.infer<typeof portfolioSchema>;

const defaultValues: TPortfolioFormData = {
  description: "",
  startFromTemplate: true,
  title: "",
};

export const PortfolioCreateDialog = ({
  open,
  onOpenChange,
  onCreated,
}: Readonly<IProps>) => {
  const createPortfolio = useCreatePortfolio();
  const { data: profile } = useProfileQuery();

  const form = useForm<TPortfolioFormData>({
    defaultValues,
    resolver: zodResolver(portfolioSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const handleClose = () => onOpenChange(false);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const record = await createPortfolio.mutateAsync({
        title: data.title,
        description:
          data.description.trim() ||
          "Custom portfolio wireframe and style moodboard",
        template: data.startFromTemplate,
        profile: {
          name: [profile?.firstName, profile?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim(),
          title: profile?.workOverviews?.[0]?.title ?? "",
          email: profile?.email ?? "",
        },
      });
      toast.success(
        data.startFromTemplate
          ? "Template portfolio created successfully"
          : "Portfolio created successfully"
      );
      handleClose();
      onCreated?.(record.id);
    } catch {
      // Error is surfaced by the shared mutation cache toast.
    }
  });

  return (
    <DrawLog onOpenChange={onOpenChange} open={open}>
      <DrawLogContent>
        <DrawLogHeader>
          <DrawLogTitle>New portfolio</DrawLogTitle>
          <DrawLogDescription>
            Start from the starter sketch template or a blank canvas.
          </DrawLogDescription>
        </DrawLogHeader>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <DrawLogBody>
            <FormInput
              autoFocus
              form={form}
              label="Title"
              name="title"
              placeholder="Fintech Lead Portfolio"
            />

            <FormInput
              form={form}
              label="Description"
              name="description"
              placeholder="e.g. Wireframe and moodboard for my AI fintech role"
            />

            <FormCheckbox
              form={form}
              label="Use starter sketch template"
              name="startFromTemplate"
            />
          </DrawLogBody>

          <DrawLogFooter>
            <DrawLogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Create</Button>
          </DrawLogFooter>
        </form>
      </DrawLogContent>
    </DrawLog>
  );
};
