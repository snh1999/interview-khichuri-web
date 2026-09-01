import { WarningIcon } from "@phosphor-icons/react";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useProfile } from "@/api/profile";
import { useCreateResume, useUploadResume } from "@/api/resumes";

import { REQUIRED_FIELDS } from "@/components/job-profile/profile.data.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { profileToFormData } from "@/components/job-profile/profile.helpers.ts";
import { UploadResume } from "@/components/resume/job-profile/UploadResume.tsx";
import { TemplatePicker } from "@/components/resume/menu/TemplatePicker.tsx";
import type { TTemplateKey } from "@/components/resume/template-registry.ts";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";

interface IProps {
  count: number;
  onSuccess: () => void;
}

export const AddResume = ({ count, onSuccess }: Readonly<IProps>) => {
  const { data: profileData } = useProfile();
  const { mutate: uploadResume, isPending: isUploading } = useUploadResume();
  const { mutate: createResume, isPending: isCreating } = useCreateResume();

  const navigate = useNavigate();

  const [resumeName, setResumeName] = useState("");
  const [templateId, setTemplateId] = useState<TTemplateKey>("mbzuai");

  const profileFormData: TProfileFormData | null = useMemo(
    () => (profileData ? profileToFormData(profileData) : null),
    [profileData]
  );

  const isProfileComplete = useMemo(
    () =>
      profileFormData !== null &&
      REQUIRED_FIELDS.every((field) => field.isFilled(profileFormData)),
    [profileFormData]
  );

  const handleUpload = useCallback(
    (file: File, name?: string) => {
      if (file.type !== "application/pdf") {
        toast.error("File must be of PDF type");
        return;
      }
      uploadResume({ file, name }, { onSuccess });
    },
    [uploadResume, onSuccess]
  );

  const handleCreate = useCallback(() => {
    if (!profileFormData) {
      return;
    }
    createResume(
      {
        content: profileFormData,
        name: resumeName.trim(),
        template: templateId,
      },
      {
        onSuccess: (resume) => {
          onSuccess();
          navigate(`/resumes/${resume.id}/edit`);
        },
      }
    );
  }, [
    createResume,
    navigate,
    onSuccess,
    profileFormData,
    resumeName,
    templateId,
  ]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setResumeName(e.target.value);

  return (
    <Tabs defaultValue="upload">
      <TabsList className="w-full">
        <TabsTrigger className="flex-1" value="upload">
          Upload
        </TabsTrigger>
        <TabsTrigger className="flex-1" value="generate">
          Create from profile
        </TabsTrigger>
      </TabsList>

      <TabsContent className="min-h-45" value="upload">
        <UploadResume
          count={count}
          isUploading={isUploading}
          onUpload={handleUpload}
        />
      </TabsContent>

      <TabsContent className="min-h-45" value="generate">
        <Card size="sm">
          {isProfileComplete ? (
            <>
              <CardHeader>
                <CardTitle>Create from Profile</CardTitle>
              </CardHeader>
              <CardContent className="w-full space-y-4 whitespace-normal">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="resume-name">Resume Name</Label>
                  <Input
                    className="text-xs"
                    disabled={isCreating}
                    id="resume-name"
                    onChange={handleInputChange}
                    placeholder="e.g. Frontend Engineer Resume"
                    value={resumeName}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Template</Label>
                  <TemplatePicker
                    disabled={isCreating}
                    onChange={setTemplateId}
                    templateId={templateId}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <AsyncButton
                  disabled={!resumeName.trim()}
                  isLoading={isCreating}
                  onClick={handleCreate}
                >
                  Create
                </AsyncButton>
              </CardFooter>
            </>
          ) : (
            <CardContent className="flex min-h-40 flex-col items-center justify-center italic">
              <WarningIcon className="size-10 text-destructive" />
              Complete your profile to create a resume from it.
            </CardContent>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
};
