import { useSearchParams } from "react-router";

interface IReturn {
  handleTabChange: (tab: string) => void;
  currentTab: string;
}

const TABS_KEY = "tab";

export const useTabs = (defaultTab: string): IReturn => {
  const [searchParameters, setSearchParameters] = useSearchParams();

  const currentTab = searchParameters.get(TABS_KEY) ?? defaultTab;

  const handleTabChange = (value: string) => {
    setSearchParameters(
      (previous) => {
        previous.set(TABS_KEY, value);
        return previous;
      },
      { replace: true }
    );
  };

  return { handleTabChange, currentTab };
};
