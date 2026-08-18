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
          className="relative"
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
            <span className="absolute -top-4 -right-8 rounded-full bg-blue-500 px-1.5 py-0.5 font-medium text-[9px] text-white shadow-xs">
              Last
            </span>
          )}
        </AuthActionButton>
      ))}
    </div>
  );
};
