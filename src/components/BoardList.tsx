import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { List, Task } from "@/types/board";
import TaskCard from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface BoardListProps {
  list: List;
  onAddTask: (listId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditList: (list: List) => void;
  onDeleteList: (listId: string) => void;
}

const BoardList = ({
  list,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditList,
  onDeleteList,
}: BoardListProps) => {
  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  return (
    <Card className="w-80 flex-shrink-0 bg-list-bg shadow-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-list-header">{list.title}</h3>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {list.tasks.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onEditList(list)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div ref={setNodeRef} className="p-4 space-y-3 min-h-[200px]">
        <SortableContext items={list.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {list.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50"
          onClick={() => onAddTask(list.id)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a task
        </Button>
      </div>
    </Card>
  );
};

export default BoardList;