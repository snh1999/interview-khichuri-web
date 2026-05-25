import { useSearchParams } from "react-router";

type TReturnType = {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
};

export const usePagination = (limitDefault?: number): TReturnType => {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const page = Number(searchParameters.get("page")) || 1;
  const limit = (Number(searchParameters.get("limit")) || limitDefault) ?? 10;

  const setLimit = (newLimit: number) => {
    setSearchParameters(
      (previous) => {
        previous.set("limit", String(newLimit));
        previous.set("page", "1");
        return previous;
      },
      { replace: true }
    );
  };

  const setPage = (newPage: number) => {
    setSearchParameters((previous) => {
      previous.set("page", String(Math.max(newPage, 1)));
      return previous;
    });
  };
  return { page, limit, setLimit, setPage };
};
