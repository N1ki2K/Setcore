import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { List } from "@/types/board";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface ListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list?: List | null;
  onSave: (listData: { id?: string; title: string }) => void;
  onDelete?: (listId: string) => void;
}

const ListDialog = ({ open, onOpenChange, list, onSave, onDelete }: ListDialogProps) => {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (list) {
      setTitle(list.title);
    } else {
      setTitle("");
    }
  }, [list, open]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      id: list?.id,
      title: title.trim(),
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (list && onDelete) {
      onDelete(list.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {list ? "Edit List" : "Create List"}
          </DialogTitle>
          <DialogDescription>
            {list ? "Update your list details." : "Create a new list for organizing tasks."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter list title..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {list && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {list ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListDialog;