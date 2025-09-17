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
import { Textarea } from "@/components/ui/textarea";
import { Board } from "@/types/board";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface BoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: Board | null;
  onSave: (boardData: { id?: string; title: string; description?: string }) => void;
  onDelete?: (boardId: string) => void;
}

const BoardDialog = ({ open, onOpenChange, board, onSave, onDelete }: BoardDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setDescription(board.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [board, open]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      id: board?.id,
      title: title.trim(),
      description: description.trim(),
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (board && onDelete) {
      onDelete(board.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {board ? "Edit Board" : "Create Board"}
          </DialogTitle>
          <DialogDescription>
            {board ? "Update your board details." : "Create a new board for organizing your work."}
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
              placeholder="Enter board title..."
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Enter board description..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {board && onDelete && (
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
              {board ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BoardDialog;