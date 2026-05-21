import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { LinkButton } from "@/components/ui/button/LinkButton.tsx";
import { Background } from "@/components/common/Background.tsx";

export const EmptyPage = () => {
  return (
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
            <LinkButton pop replace path="/login">
              Back to login
            </LinkButton>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </Background>
  );
};
