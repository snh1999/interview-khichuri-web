import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { type ChangeEvent, useDeferredValue, useMemo, useState } from "react";
import { AppCombobox } from "@/components/common/form/combobox/AppCombobox.tsx";
import { QuestionBankCard } from "@/components/notes/question/QuestionBankCard.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group.tsx";
import {
  QUESTION_BANK,
  QUESTION_BANK_CATEGORIES,
  QUESTION_BANK_CATEGORY_LABELS,
  type TQuestionBankCategory,
} from "@/lib/questions/question-bank.ts";
import { createQuestionBankSearch } from "@/lib/search.ts";

export const QuestionsTab = ({
  onCreateNote,
}: {
  onCreateNote: (bankId: string) => void;
}) => {
  const [categories, setCategories] = useState<TQuestionBankCategory[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const searchIndex = useMemo(() => createQuestionBankSearch(), []);

  const items = useMemo(() => {
    const query = deferredSearch.trim();
    const searched =
      query.length === 0
        ? QUESTION_BANK
        : searchIndex.search(query).map((result) => result.doc);
    return categories.length === 0
      ? searched
      : searched.filter((item) => categories.includes(item.category));
  }, [deferredSearch, searchIndex, categories]);

  const handleCategoriesChange = (values: Array<string | number>) =>
    setCategories(values as TQuestionBankCategory[]);
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  const handleComboboxOption = (category: TQuestionBankCategory) => ({
    label: QUESTION_BANK_CATEGORY_LABELS[category],
    value: category,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full sm:min-w-60 sm:flex-1">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <MagnifyingGlassIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              onChange={handleSearchChange}
              placeholder="Search questions..."
              value={search}
            />
          </InputGroup>
        </div>
        <div className="w-full sm:w-60">
          <AppCombobox
            data={[...QUESTION_BANK_CATEGORIES]}
            hideChips
            multiple
            onChange={handleCategoriesChange}
            placeholder="Filter categories"
            toOption={handleComboboxOption}
            value={categories}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {QUESTION_BANK.length === 0
                ? "No questions yet."
                : "No questions match your search."}
            </EmptyTitle>
            <EmptyDescription>
              {QUESTION_BANK.length === 0
                ? "Question bank entries will appear here."
                : "Try a different query or category."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <QuestionBankCard
              item={item}
              key={item.id}
              onCreateNote={onCreateNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};
