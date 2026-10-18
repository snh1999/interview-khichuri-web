import { useEffect, useRef } from "react";
import { Navigate, useParams } from "react-router";
import {
  useCollectOrphanAssets,
  usePersistDraft,
  usePortfolio,
} from "@/api/portfolio/idb.ts";
import { RESUMES_PAGE } from "@/app.constants.ts";
import { Spinner } from "@/components/ui/spinner";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";
import { PortfolioSketchPage } from "./PortfolioSketchPage.tsx";

export const PortfolioEditorPage = () => {
  const { portfolioId } = useParams();
  const { data: portfolio, isPending } = usePortfolio(portfolioId);
  const setDraft = useSketchBuilderStore((s) => s.setDraft);
  const draftId = useSketchBuilderStore((s) => s.draft?.id);
  const seededIdRef = useRef<string | null>(null);

  usePersistDraft();
  useCollectOrphanAssets();

  // Seed the live canvas buffer once per portfolio id; the draft is the source
  // of truth for edits from here on, flushed back to IDB by `usePersistDraft`.
  useEffect(() => {
    if (portfolio && seededIdRef.current !== portfolio.id) {
      seededIdRef.current = portfolio.id;
      setDraft(portfolio);
    }
  }, [portfolio, setDraft]);

  if (!portfolioId) {
    return <Navigate replace to={`${RESUMES_PAGE}?tab=portfolio`} />;
  }

  if (isPending) {
    return <Spinner />;
  }

  if (!portfolio) {
    return <Navigate replace to={`${RESUMES_PAGE}?tab=portfolio`} />;
  }

  if (draftId !== portfolio.id) {
    return <Spinner />;
  }

  return <PortfolioSketchPage />;
};
