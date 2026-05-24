import { useIsFetching } from "@tanstack/react-query";

export const RefetchIndicator = () => {
  const isFetching = useIsFetching();
  if (!isFetching) return null;

  return (
    <div className="bg-primary fixed top-0 right-0 left-0 h-0.5 animate-pulse" />
  );
};
