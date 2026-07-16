import type { ReactNode } from "react";
import { HOMEPAGE } from "@/app.constants.ts";
import { Background } from "@/components/common/Background.tsx";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

interface IProps {
  children?: ReactNode;
  title?: string;
  description?: string;
}

export const EmptyPage = ({
  children,
  title,
  description,
}: Readonly<IProps>) => (
  <Background>
    <Empty>
      <EmptyHeader>
        <EmptyTitle className="text-2xl">
          {title ?? "404 - Not Found"}
        </EmptyTitle>
        <EmptyDescription>
          {description ?? "The page you're looking for doesn't exist."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          {children ?? (
            <LinkButton path={HOMEPAGE} pop replace>
              Back to home
            </LinkButton>
          )}
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  </Background>
);
