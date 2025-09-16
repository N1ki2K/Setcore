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
import { Workspace } from "@/types/workspace";
import { useState, useEffect } from "react";

interface WorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace?: Workspace | null;
  onSave: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'boards'> & { id?: string }) => void;
  onDelete?: (workspaceId: string) => void;
}

const colors = [
  '#3b82f6', // blue
  '#ef4444', // red  
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

const WorkspaceDialog = ({ open, onOpenChange, workspace, onSave, onDelete }: WorkspaceDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description || "");
      setColor(workspace.color || colors[0]);
    } else {
      setName("");
      setDescription("");
      setColor(colors[0]);
    }
  }, [workspace, open]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      id: workspace?.id,
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (workspace && onDelete) {
      onDelete(workspace.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{workspace ? "Edit Workspace" : "Create New Workspace"}</DialogTitle>
          <DialogDescription>
            {workspace ? "Update your workspace details." : "Create a new workspace to organize your boards."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name..."
              className="w-full"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add workspace description..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex space-x-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption 
                      ? 'border-foreground scale-110' 
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div>
            {workspace && onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {workspace ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceDialog;