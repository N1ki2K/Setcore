import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User } from "lucide-react";
import { Task } from "@/types/board";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-task-high text-white';
      case 'medium':
        return 'bg-task-medium text-white';
      case 'low':
        return 'bg-task-low text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 cursor-pointer hover:shadow-card-hover transition-shadow duration-200 group"
      onClick={() => onEdit(task)}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-medium text-card-foreground leading-tight">
            {task.title}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Add dropdown menu logic here
            }}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {task.priority && (
              <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
            )}
          </div>
          
          {task.assignee && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;