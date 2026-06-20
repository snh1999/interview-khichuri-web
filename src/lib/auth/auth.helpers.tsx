import {
  GithubLogoIcon,
  GitlabLogoSimpleIcon,
  GoogleLogoIcon,
  type Icon,
  type IconWeight,
} from "@phosphor-icons/react";

export type TOauthProviders = "google" | "github" | "gitlab";

interface IProvider {
  id: TOauthProviders;
  name: string;
  icon: Icon;
  weight?: IconWeight;
  color?: string;
}

export const oauthProviders: IProvider[] = [
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
