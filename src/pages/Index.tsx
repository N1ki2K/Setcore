import { useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, closestCorners } from "@dnd-kit/core";
import { toast } from "sonner";
import BoardHeader from "@/components/BoardHeader";
import BoardList from "@/components/BoardList";
import TaskDialog from "@/components/TaskDialog";
import { Board, List, Task } from "@/types/board";

const Index = () => {
  // Initial board data
  const [board] = useState<Board>({
    id: "1",
    title: "Project Dashboard",
    description: "Main project tracking board",
    createdAt: new Date(),
    lists: [
      {
        id: "todo",
        title: "To Do",
        tasks: [
          {
            id: "task-1",
            title: "Design user interface mockups",
            description: "Create wireframes and visual designs for the main dashboard",
            priority: "high",
            assignee: "Alice",
            createdAt: new Date(),
          },
          {
            id: "task-2", 
            title: "Set up project repository",
            description: "Initialize Git repo and set up CI/CD pipeline",
            priority: "medium",
            assignee: "Bob",
            createdAt: new Date(),
          },
        ],
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: [
          {
            id: "task-3",
            title: "Implement authentication system",
            description: "Add login/logout functionality with proper session management",
            priority: "high",
            assignee: "Charlie",
            createdAt: new Date(),
          },
        ],
      },
      {
        id: "done",
        title: "Done",
        tasks: [
          {
            id: "task-4",
            title: "Project planning and requirements",
            description: "Define project scope, timeline, and deliverables",
            priority: "low",
            assignee: "Diana",
            createdAt: new Date(),
          },
        ],
      },
    ],
  });

  const [lists, setLists] = useState<List[]>(board.lists);
  const [taskDialog, setTaskDialog] = useState<{
    open: boolean;
    task?: Task | null;
    listId?: string;
  }>({ open: false });

  const handleAddList = () => {
    const newList: List = {
      id: `list-${Date.now()}`,
      title: "New List",
      tasks: [],
    };
    setLists([...lists, newList]);
    toast.success("New list added!");
  };

  const handleAddTask = (listId: string) => {
    setTaskDialog({ open: true, listId });
  };

  const handleEditTask = (task: Task) => {
    setTaskDialog({ open: true, task });
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit existing task
      setLists(currentLists =>
        currentLists.map(list => ({
          ...list,
          tasks: list.tasks.map(task =>
            task.id === taskData.id
              ? { ...task, ...taskData, id: task.id, createdAt: task.createdAt }
              : task
          ),
        }))
      );
      toast.success("Task updated!");
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
      };

      setLists(currentLists =>
        currentLists.map(list =>
          list.id === taskDialog.listId
            ? { ...list, tasks: [...list.tasks, newTask] }
            : list
        )
      );
      toast.success("Task created!");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setLists(currentLists =>
      currentLists.map(list => ({
        ...list,
        tasks: list.tasks.filter(task => task.id !== taskId),
      }))
    );
    toast.success("Task deleted!");
  };

  const handleEditList = (list: List) => {
    // Placeholder for list editing
    toast.info("List editing coming soon!");
  };

  const handleDeleteList = (listId: string) => {
    setLists(currentLists => currentLists.filter(list => list.id !== listId));
    toast.success("List deleted!");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newListId = over.id as string;

    // Find current task and list
    let currentListId: string | null = null;
    let task: Task | null = null;

    for (const list of lists) {
      const foundTask = list.tasks.find(t => t.id === taskId);
      if (foundTask) {
        currentListId = list.id;
        task = foundTask;
        break;
      }
    }

    if (!task || !currentListId || currentListId === newListId) return;

    // Move task to new list
    setLists(currentLists =>
      currentLists.map(list => {
        if (list.id === currentListId) {
          return { ...list, tasks: list.tasks.filter(t => t.id !== taskId) };
        }
        if (list.id === newListId) {
          return { ...list, tasks: [...list.tasks, task] };
        }
        return list;
      })
    );

    toast.success("Task moved!");
  };

  return (
    <div className="min-h-screen bg-board-bg">
      <BoardHeader title={board.title} onAddList={handleAddList} />
      
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <main className="p-6 overflow-x-auto">
          <div className="flex space-x-6 pb-6">
            {lists.map((list) => (
              <BoardList
                key={list.id}
                list={list}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onEditList={handleEditList}
                onDeleteList={handleDeleteList}
              />
            ))}
          </div>
        </main>
      </DndContext>

      <TaskDialog
        open={taskDialog.open}
        onOpenChange={(open) => setTaskDialog({ open })}
        task={taskDialog.task}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default Index;