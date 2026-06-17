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

export const EmptyPage = () => (
  <Background>
    <Empty>
      <EmptyHeader>
        <EmptyTitle className="text-2xl">404 - Not Found</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for doesn&apos;t exist.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          <LinkButton path={HOMEPAGE} pop replace>
            Back to home
          </LinkButton>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  </Background>
);
