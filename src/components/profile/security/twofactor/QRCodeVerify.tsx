import { Button } from "@/components/ui/button.tsx";
import { LoadingSwap } from "@/components/ui/loading-swap.tsx";
import { FormInput } from "@/components/common/form/FormInput.tsx";
import QRCode from "react-qr-code";
import { useQRCodeVerifyForm } from "@/components/profile/security/twofactor/twofactor.helpers.ts";

export type TwoFactorData = {
  totpURI: string;
  backupCodes: string[];
};

export const QRCodeVerify = ({
  totpURI,
  backupCodes,
  clearCodes,
}: Readonly<TwoFactorData & { clearCodes: () => void }>) => {
  const { enabled, form, isLoading, onSubmit } = useQRCodeVerifyForm();

  if (enabled) {
    return (
      <>
        <p className="text-muted-foreground mb-2 text-sm">
          Save these backup codes in a safe place. You can use them to access
          your account.
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <div key={index} className="font-mono text-sm">
              {code}
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={clearCodes}>
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
        <FormInput form={form} name="token" label="Code" />
        <Button type="submit" disabled={isLoading} className="w-full">
          <LoadingSwap isLoading={isLoading}>Submit Code</LoadingSwap>
        </Button>
      </form>
      <div className="mx-auto w-fit bg-white p-4">
        <QRCode size={256} value={totpURI} />
      </div>
    </div>
  );
};
