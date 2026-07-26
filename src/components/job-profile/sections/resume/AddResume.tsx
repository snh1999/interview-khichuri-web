import { WarningIcon } from "@phosphor-icons/react";
import { useCallback, useMemo } from "react";
import { useProfile, useUploadResume } from "@/api/profile/profiles.ts";
import { REQUIRED_FIELDS } from "@/components/job-profile/profile.data.ts";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { profileToFormData } from "@/components/job-profile/profile.helpers.ts";
import { UploadResume } from "@/components/job-profile/sections/resume/UploadResume.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

interface IProps {
  count: number;
  onSuccess: () => void;
  compactTab?: boolean;
}

export const AddResume = ({ count, onSuccess }: Readonly<IProps>) => {
  const { data: profileData } = useProfile();
  const { mutate: uploadResume, isPending: isUploading } = useUploadResume();

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
        return;
      }
      uploadResume({ file, name }, { onSuccess });
    },
    [uploadResume, onSuccess]
  );

  return (
    <Tabs defaultValue="upload">
      <TabsList className="w-full">
        <TabsTrigger className="flex-1" value="upload">
          Upload
        </TabsTrigger>
        <TabsTrigger className="flex-1" value="generate">
          Generate from profile
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
                <CardTitle>Generate from Profile</CardTitle>
              </CardHeader>
              <CardContent className="w-full whitespace-normal">
                <Textarea
                  className="min-h-30 flex-1"
                  id="resume-prompt"
                  placeholder="e.g. Focus on frontend architecture and team leadership"
                />
              </CardContent>
              <CardFooter className="justify-end">
                <Button>Generate</Button>
              </CardFooter>
            </>
          ) : (
            <CardContent className="flex min-h-40 flex-col items-center justify-center italic">
              <WarningIcon className="size-10 text-destructive" />
              Complete your profile to generate a tailored resume.
            </CardContent>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
};
