import { BackspaceIcon, FloppyDiskBackIcon } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";

interface ISaveBarProps {
  isSaving: boolean;
}

export const SaveBar = ({ isSaving }: Readonly<ISaveBarProps>) => {
  const { formState, reset } = useFormContext();
  const hasChanges = Object.keys(formState.dirtyFields).length > 0;
  const resetForm = () => reset();

  if (!hasChanges) {
    return null;
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex gap-2 rounded-lg border bg-card p-2 shadow-lg">
      <Button
        disabled={isSaving}
        onClick={resetForm}
        type="button"
        variant="outline"
      >
        <BackspaceIcon />
      </Button>
      <AsyncButton isLoading={isSaving} type="submit">
        <FloppyDiskBackIcon /> Save
      </AsyncButton>
    </div>
  );
};
