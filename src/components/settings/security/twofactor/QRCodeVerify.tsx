import { CopyIcon, XIcon } from "@phosphor-icons/react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { useQRCodeVerifyForm } from "@/components/settings/security/twofactor/twofactor.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card.tsx";
import { LoadingSwap } from "@/components/ui/loading-swap.tsx";

export interface ITwoFactorData {
  totpURI: string;
  backupCodes: string[];
}

export const QRCodeVerify = ({
  totpURI,
  backupCodes,
  clearCodes,
}: Readonly<ITwoFactorData & { clearCodes: () => void }>) => {
  const { enabled, form, isLoading, onSubmit } = useQRCodeVerifyForm();

  const handleCopyCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      toast.success("Backup codes copied to clipboard");
    } catch {
      toast.error("Failed to copy backup codes");
    }
  };

  if (enabled) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>
            Save these backup codes in a safe place. You can use them to access
            your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {backupCodes.map((code) => (
            <div className="font-mono text-sm" key={code}>
              {code}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between gap-3 pr-4">
          <Button onClick={clearCodes} variant="destructive">
            Close
          </Button>
          <Button onClick={handleCopyCodes}>
            <CopyIcon />
            Copy codes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Scan this QR code with your authenticator app and enter the code
          below:
        </CardDescription>
        <CardAction>
          <Button
            className="rounded-xl"
            onClick={clearCodes}
            size="icon-sm"
            variant="destructive"
          >
            <XIcon weight="bold" />
            <span className="sr-only">Cancel two-factor setup</span>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormInput form={form} label="Code" name="token" />
          <Button className="w-full" disabled={isLoading} type="submit">
            <LoadingSwap isLoading={isLoading}>Submit Code</LoadingSwap>
          </Button>
        </form>
      </CardContent>
      <div className="mx-auto w-fit bg-white p-4">
        <QRCode size={256} value={totpURI} />
      </div>
    </Card>
  );
};
