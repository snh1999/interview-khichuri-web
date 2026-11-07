import {
  DotsThreeIcon,
  PencilLineIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ILookupEntry } from "@/api/lookups";
import {
  useCreateLookup,
  useDeleteLookup,
  useUpdateLookup,
} from "@/api/lookups";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

type TSchema = "roles" | "topics" | "industries";

const SCHEMA_LABELS: Record<TSchema, string> = {
  industries: "Industries",
  roles: "Roles",
  topics: "Topics",
};

const SCHEMA_SINGULAR: Record<TSchema, string> = {
  industries: "industry",
  roles: "role",
  topics: "topic",
};

interface IProps {
  readonly schema: TSchema;
  readonly data: ILookupEntry[] | undefined;
  readonly isPending: boolean;
}

export const LookupManager = ({ schema, data, isPending }: IProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<ILookupEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<ILookupEntry | null>(null);

  const { mutate: createEntry, isPending: isCreating } =
    useCreateLookup(schema);
  const { mutate: updateEntry, isPending: isUpdating } =
    useUpdateLookup(schema);
  const { mutate: deleteEntryMutation, isPending: isDeleting } =
    useDeleteLookup(schema);

  const label = SCHEMA_LABELS[schema];
  const singular = SCHEMA_SINGULAR[schema];
  const count = data?.length ?? 0;

  const handleCreate = (name: string) => {
    createEntry(
      { name },
      {
        onSuccess: () => {
          setAddOpen(false);
          toast.success(`${singular} created`);
        },
      }
    );
  };

  const removeDeleteEntry = () => setDeleteEntry(null);
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      removeDeleteEntry();
    }
  };
  const handleEditDialogChange = (open: boolean) => {
    if (!open) {
      setEditEntry(null);
    }
  };
  const handleDeleteEntry = () => {
    if (!deleteEntry) {
      return;
    }
    deleteEntryMutation(deleteEntry.id, {
      onSuccess: () => {
        removeDeleteEntry();
        toast.success(`${singular} deleted`);
      },
    });
  };
  const handleEditDialogSubmit = (name: string, isApproved: boolean) => {
    if (!editEntry) {
      return;
    }
    updateEntry(
      { id: editEntry.id, isApproved, name },
      {
        onSuccess: () => {
          setEditEntry(null);
          toast.success(`${singular} updated`);
        },
      }
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-md font-semibold">{label}</h2>
          <Badge variant="outline">{count}</Badge>
        </div>
        <Dialog onOpenChange={setAddOpen} open={addOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <PlusIcon />
                Add {singular}
              </Button>
            }
          />
          <AddEditDialogContent
            description={`Create a new ${singular} entry.`}
            isSubmitting={isCreating}
            key={addOpen ? "add-open" : "add-closed"}
            onSubmit={handleCreate}
            submitLabel="Create"
            title={`Add ${singular}`}
          />
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell
                  className="text-muted-foreground py-4 text-center"
                  colSpan={3}
                >
                  Loading...
                </TableCell>
              </TableRow>
              // biome-ignore lint/style/noNestedTernary: <>
            ) : count === 0 ? (
              <TableRow>
                <TableCell
                  className="text-muted-foreground py-4 text-center"
                  colSpan={3}
                >
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              data?.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>
                    <Badge variant={entry.isApproved ? "default" : "outline"}>
                      {entry.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            aria-label={`Actions for ${entry.name}`}
                            size="icon"
                            variant="ghost"
                          >
                            <DotsThreeIcon />
                          </Button>
                        }
                      />
                      <DropdownMenuContent>
                        {/** biome-ignore lint/performance/noJsxPropsBind: <> */}
                        <DropdownMenuItem onClick={() => setEditEntry(entry)}>
                          <PencilLineIcon />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          // biome-ignore lint/performance/noJsxPropsBind: <>
                          onClick={() => setDeleteEntry(entry)}
                          variant="destructive"
                        >
                          <TrashIcon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog onOpenChange={handleEditDialogChange} open={editEntry !== null}>
        <AddEditDialogContent
          description={`Update the ${singular} entry.`}
          initialApproved={editEntry?.isApproved ?? false}
          initialName={editEntry?.name}
          isSubmitting={isUpdating}
          key={editEntry?.id ?? "edit-none"}
          onSubmit={handleEditDialogSubmit}
          showApproved
          submitLabel="Save"
          title={`Edit ${singular}`}
        />
      </Dialog>

      <AlertDialog
        onOpenChange={handleDialogChange}
        open={deleteEntry !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{deleteEntry?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={removeDeleteEntry}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteEntry}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface IAddEditContentProps {
  readonly title: string;
  readonly description: string;
  readonly submitLabel: string;
  readonly initialName?: string;
  readonly initialApproved?: boolean;
  readonly showApproved?: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (name: string, isApproved: boolean) => void;
}

const AddEditDialogContent = ({
  title,
  description,
  submitLabel,
  initialName = "",
  initialApproved = false,
  showApproved = false,
  isSubmitting,
  onSubmit,
}: IAddEditContentProps) => {
  const [name, setName] = useState(initialName);
  const [approved, setApproved] = useState(initialApproved);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setName(event.target.value);

  const handleSubmit = () => onSubmit(name.trim(), approved);

  return (
    <DialogContent
    // onClose={() => {
    //   setName(initialName);
    //   setApproved(initialApproved);
    // }}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="lookup-name">Name</Label>
          <Input
            id="lookup-name"
            onChange={handleInputChange}
            placeholder="Enter name"
            value={name}
          />
        </div>
        {showApproved ? (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={approved}
              id="lookup-approved"
              onCheckedChange={setApproved}
            />
            <Label htmlFor="lookup-approved">Approved</Label>
          </div>
        ) : null}
      </div>
      <DialogFooter>
        <AsyncButton
          disabled={!name.trim() || name.trim().length < 2}
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          {submitLabel}
        </AsyncButton>
      </DialogFooter>
    </DialogContent>
  );
};
