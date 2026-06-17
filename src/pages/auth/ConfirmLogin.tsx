import { BackupCodeForm } from "@/components/auth/2fa/BackupCodeForm.tsx";
import { TotpForm } from "@/components/auth/2fa/TotpForm.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ConfirmLoginPage = () => (
  <div className="my-6 px-4">
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="font-bold text-2xl">
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="totp">
          <TabsList className="mb-8 grid w-full grid-cols-2">
            <TabsTrigger value="totp">Authenticator</TabsTrigger>
            <TabsTrigger value="backup">Backup Code</TabsTrigger>
          </TabsList>

          <TabsContent value="totp">
            <TotpForm />
          </TabsContent>

          <TabsContent value="backup">
            <BackupCodeForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
);

export default ConfirmLoginPage;
