import { AuthActionButton } from "@/components/auth/AuthActionButton.tsx";
import { oauthProviders } from "@/lib/auth/auth.helpers.tsx";
import { getLastUsedLoginMethod, oauthLogin } from "@/lib/auth/auth-client.ts";

export const OauthSection = () => {
  const lastMethod = getLastUsedLoginMethod();
  return (
    <div className="grid w-full grid-cols-3 gap-3">
      {oauthProviders.map((provider) => (
        <AuthActionButton
          // biome-ignore lint/performance/noJsxPropsBind: <child section is generic>
          action={() => oauthLogin(provider.id)}
          failFallbackMessage={`Failed to connect to ${provider.id}`}
          key={provider.id}
          size="lg"
          successMessage={`Redirecting to ${provider.name}`}
          variant="outline"
        >
          <provider.icon
            className="h-5 w-5"
            color={provider.color}
            weight={provider.weight}
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
