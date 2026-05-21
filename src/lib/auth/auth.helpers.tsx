import {
  GoogleLogoIcon,
  GithubLogoIcon,
  GitlabLogoSimpleIcon,
  type Icon,
  type IconWeight,
} from "@phosphor-icons/react";

export type TOauthProviders = "google" | "github" | "gitlab";

type TProvider = {
  id: TOauthProviders;
  name: string;
  icon: Icon;
  weight?: IconWeight;
  color?: string;
};

export const oauthProviders: TProvider[] = [
  {
    id: "google" as const,
    name: "Google",
    icon: GoogleLogoIcon,
    weight: "bold",
  },
  {
    id: "github" as const,
    name: "GitHub",
    icon: GithubLogoIcon,
    weight: "fill",
    color: "grey",
  },
  {
    id: "gitlab" as const,
    name: "GitLab",
    icon: GitlabLogoSimpleIcon,
    weight: "fill",
    color: "orange",
  },
];

export const SUPPORTED_OAUTH_PROVIDERS: TOauthProviders[] = [
  "github",
  "gitlab",
  "google",
];
