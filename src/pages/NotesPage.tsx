import {
  NotebookIcon,
  NotePencilIcon,
  PlusCircleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { type INote, useGetNote, useUpdateNote } from "@/api/notes";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { NoteDetailDrawer } from "@/components/notes/NoteDetailDrawer.tsx";
import { NoteFormDialog } from "@/components/notes/NoteFormDialog.tsx";
import { NotesTab } from "@/components/notes/NotesTab.tsx";
import type { INotePreset } from "@/components/notes/notes.helpers.ts";
import { QuestionsTab } from "@/components/notes/question/QuestionsTab.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { useTabs } from "@/hooks/useTabs.ts";

interface IDialogState {
  note?: INote;
  preset?: INotePreset;
}

const NotesPage = () => (
  <AppErrorSuspense fallback={NotesPageSkeleton}>
    <NotesContent />
  </AppErrorSuspense>
);

const NotesContent = () => {
  const { currentTab, handleTabChange } = useTabs("notes");
  const [dialog, setDialog] = useState<IDialogState | null>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const { data: selectedNote } = useGetNote(selectedId);

  const updateNote = useUpdateNote();
  const onFavoriteToggle = (note: INote) =>
    updateNote.mutateAsync({ id: note.id, isFavorite: !note.isFavorite });

  const openCreateDialog = () => setDialog({});
  const closeDialog = () => setDialog(null);
  const openEditDialog = (note: INote) => {
    setSelectedId(undefined);
    setDialog({ note });
  };
  const openBankDialog = (bankId: string) =>
    setDialog({
      preset: { noteType: "question_bank", questionBankId: bankId },
    });
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };
  const handleDetailOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedId(undefined);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-semibold text-xl">Notes</h1>
        <Button onClick={openCreateDialog} variant="outline">
          <PlusCircleIcon />
          New Note
        </Button>
      </div>

      <Tabs
        className="space-y-2"
        onValueChange={handleTabChange}
        value={currentTab}
      >
        <TabsList className="*:px-10" variant="line">
          <TabsTrigger value="notes">
            <NotePencilIcon />
            <span className="max-sm:hidden">My Notes</span>
          </TabsTrigger>
          <TabsTrigger value="questions">
            <NotebookIcon />
            <span className="max-sm:hidden">Questions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <AppErrorSuspense>
            <NotesTab
              onEdit={openEditDialog}
              onFavoriteToggle={onFavoriteToggle}
              onSelect={setSelectedId}
            />
          </AppErrorSuspense>
        </TabsContent>

        <TabsContent value="questions">
          <AppErrorSuspense>
            <QuestionsTab onCreateNote={openBankDialog} />
          </AppErrorSuspense>
        </TabsContent>
      </Tabs>

      <NoteFormDialog
        note={dialog?.note}
        onOpenChange={handleDialogOpenChange}
        open={dialog !== null}
        preset={dialog?.preset}
      />

      <NoteDetailDrawer
        note={selectedNote}
        onEdit={openEditDialog}
        onFavoriteToggle={onFavoriteToggle}
        onOpenChange={handleDetailOpenChange}
        open={Boolean(selectedId)}
      />
    </div>
  );
};

const NotesPageSkeleton = () => (
  <div className="w-full space-y-4">
    <div className="mb-6 flex items-center justify-between">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-10 w-28" />
    </div>
    <Skeleton className="h-10 w-full" />
    <div className="space-y-1.5">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
);

export { NotesPage };
