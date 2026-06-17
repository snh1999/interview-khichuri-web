import QRCode from "react-qr-code";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import { useQRCodeVerifyForm } from "@/components/settings/security/twofactor/twofactor.helpers.ts";
import { Button } from "@/components/ui/button.tsx";
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

  if (enabled) {
    return (
      <>
        <p className="mb-2 text-muted-foreground text-sm">
          Save these backup codes in a safe place. You can use them to access
          your account.
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {backupCodes.map((code) => (
            <div className="font-mono text-sm" key={code}>
              {code}
            </div>
          ))}
        </div>
        <Button onClick={clearCodes} variant="outline">
          Done
        </Button>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Scan this QR code with your authenticator app and enter the code below:
      </p>

      <form className="space-y-4" onSubmit={onSubmit}>
        <FormInput form={form} label="Code" name="token" />
        <Button className="w-full" disabled={isLoading} type="submit">
          <LoadingSwap isLoading={isLoading}>Submit Code</LoadingSwap>
        </Button>
      </form>
      <div className="mx-auto w-fit bg-white p-4">
        <QRCode size={256} value={totpURI} />
      </div>
    </div>
  );
};
