import { PencilIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import type { INote } from "@/api/notes";
import { useDeleteNote } from "@/api/notes";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { MarkdownContent } from "@/components/common/MarkdownContent.tsx";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator.tsx";

interface IProps {
  note?: INote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (note: INote) => void;
  onFavoriteToggle: (note: INote) => Promise<unknown>;
}

export const NoteDetailDrawer = ({ note, ...props }: Readonly<IProps>) => {
  if (!note) {
    return null;
  }
  return <NoteDetailContent note={note} {...props} />;
};

const NoteDetailContent = ({
  open,
  note,
  onEdit,
  onOpenChange,
  onFavoriteToggle,
}: Readonly<IProps> & {
  note: INote;
}) => {
  const { mutateAsync: deleteNote } = useDeleteNote();

  const handleToggleFavorite = () => onFavoriteToggle(note);
  const handleDelete = async () => {
    await deleteNote(note.id);
    onOpenChange(false);
  };
  const handleEdit = () => onEdit(note);

  const date = format(note.updatedAt, "dd MMMM, yyyy");

  const handleOpenChange = (state: boolean) => onOpenChange(state);

  return (
    <Drawer onOpenChange={handleOpenChange} open={open} showSwipeHandle>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex flex-row items-start justify-between gap-3 text-left!">
          <div className="min-w-0">
            <DrawerTitle className="text-base">{note.title}</DrawerTitle>
            <DrawerDescription>{date}</DrawerDescription>
          </div>
          <div className="flex items-center gap-1">
            <FavoriteButton
              icon="pin"
              isFavorite={note.isFavorite}
              onToggle={handleToggleFavorite}
              size="icon"
            />

            <DrawerClose
              render={
                <Button
                  aria-label="Close note"
                  className="text-muted-foreground"
                  size="icon"
                  variant="ghost"
                >
                  <XIcon />
                </Button>
              }
            />
          </div>
        </DrawerHeader>

        <Separator className="mt-2" />

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {note.details?.trim() ? (
            <MarkdownContent content={note.details} />
          ) : (
            <p className="text-muted-foreground text-sm">
              No details for this note yet.
            </p>
          )}
        </div>

        <DrawerFooter className="flex-row justify-between gap-2">
          <MutationButton
            actionLabel="Delete note"
            dialogDescription="The note and its contents will be permanently removed."
            dialogTitle="Delete this note?"
            mutationFn={handleDelete}
            requireConfirmation
            successMessage="Note deleted"
            variant="destructive"
          >
            <TrashIcon /> Delete
          </MutationButton>

          <Button onClick={handleEdit} variant="outline">
            <PencilIcon /> Edit
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
