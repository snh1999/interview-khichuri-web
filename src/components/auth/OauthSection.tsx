import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { oauthProviders } from "@/lib/auth/auth.helpers.tsx";
import { getLastUsedLoginMethod, oauthLogin } from "@/lib/auth/auth-client.ts";

export const OauthSection = () => {
  const lastMethod = getLastUsedLoginMethod();
  return (
    <div className="grid w-full grid-cols-3 gap-3">
      {oauthProviders.map((provider) => (
        <AuthActionButton
          key={provider.id}
          variant="outline"
          size="lg"
          action={() => oauthLogin(provider.id)}
          successMessage={`Redirecting to ${provider.name}`}
          failFallbackMessage={`Failed to connect to ${provider.id}`}
        >
          <provider.icon
            className="h-5 w-5"
            weight={provider.weight}
            color={provider.color}
          />
          {provider.name}
          {lastMethod === provider.id && (
            <span className="absolute bottom-4 left-17 m-0 ml-2 rounded-md bg-blue-500 p-0.75 text-[9px] text-white">
              Last
            </span>
          )}
        </AuthActionButton>
      ))}
    </div>
  );
};
