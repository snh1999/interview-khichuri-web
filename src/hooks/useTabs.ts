import { useSearchParams } from "react-router";

interface IReturn {
  handleTabChange: (tab: string) => void;
  currentTab: string;
}

export const useTabs = (defaultTab: string): IReturn => {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const currentTab = searchParameters.get("tab") ?? defaultTab;

  const handleTabChange = (value: string) => {
    setSearchParameters(
      (previous) => {
        previous.set("tab", value);
        return previous;
      },
      { replace: true }
    );
  };

  return {
    handleTabChange,
    currentTab,
  };
};
