import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import BoardHeader from "@/components/BoardHeader";
import BoardList from "@/components/BoardList";
import TaskDialog from "@/components/TaskDialog";
import AuthDialog from "@/components/AuthDialog";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import WorkspaceDialog from "@/components/WorkspaceDialog";
import { Board, List, Task } from "@/types/board";
import { Workspace as WorkspaceType } from "@/types/workspace";

const Workspace = () => {
  const { workspaceId, boardId } = useParams();
  const navigate = useNavigate();
  
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType | null>(null);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  
  const [taskDialog, setTaskDialog] = useState<{
    open: boolean;
    task?: Task | null;
    listId?: string;
  }>({ open: false });
  
  const [workspaceDialog, setWorkspaceDialog] = useState<{
    open: boolean;
    workspace?: WorkspaceType | null;
  }>({ open: false });
  
  const [authDialog, setAuthDialog] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Load user and workspaces
  useEffect(() => {
    const savedUser = localStorage.getItem('taskboard_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadWorkspaces();
    } else {
      setAuthDialog(true);
    }
  }, []);

  // Load current workspace and board when IDs change
  useEffect(() => {
    if (workspaces.length > 0 && workspaceId) {
      const workspace = workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
        
        if (boardId) {
          const board = workspace.boards.find(b => b.id === boardId);
          if (board) {
            setCurrentBoard(board);
            setLists(board.lists);
          } else {
            // Board not found, redirect to workspace
            navigate(`/workspace/${workspaceId}`);
          }
        } else {
          // No board selected, show first board or create one
          if (workspace.boards.length > 0) {
            navigate(`/workspace/${workspaceId}/board/${workspace.boards[0].id}`);
          } else {
            setCurrentBoard(null);
            setLists([]);
          }
        }
      } else {
        // Workspace not found, redirect to workspace list
        navigate('/workspaces');
      }
    }
  }, [workspaces, workspaceId, boardId, navigate]);

  const loadWorkspaces = () => {
    const savedWorkspaces = localStorage.getItem('taskboard_workspaces');
    if (savedWorkspaces) {
      setWorkspaces(JSON.parse(savedWorkspaces));
    } else {
      // Create default workspace with sample board
      const defaultBoard: Board = {
        id: "board-1",
        title: "Project Dashboard",
        description: "Main project tracking board",
        workspaceId: "default",
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
      };

      const defaultWorkspace: WorkspaceType = {
        id: 'default',
        name: 'My Workspace',
        description: 'Default workspace for your projects',
        color: '#3b82f6',
        boards: [defaultBoard],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setWorkspaces([defaultWorkspace]);
      localStorage.setItem('taskboard_workspaces', JSON.stringify([defaultWorkspace]));
    }
  };

  const saveWorkspaces = (updatedWorkspaces: WorkspaceType[]) => {
    setWorkspaces(updatedWorkspaces);
    localStorage.setItem('taskboard_workspaces', JSON.stringify(updatedWorkspaces));
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    loadWorkspaces();
  };

  const handleLogout = () => {
    localStorage.removeItem('taskboard_user');
    setUser(null);
    navigate('/workspaces');
    toast.success("Logged out successfully!");
  };

  const handleCreateWorkspace = () => {
    setWorkspaceDialog({ open: true });
  };

  const handleEditWorkspace = (workspace: WorkspaceType) => {
    setWorkspaceDialog({ open: true, workspace });
  };

  const handleSaveWorkspace = (workspaceData: Omit<WorkspaceType, 'id' | 'createdAt' | 'updatedAt' | 'boards'> & { id?: string }) => {
    if (workspaceData.id) {
      // Edit existing workspace
      const updatedWorkspaces = workspaces.map(ws =>
        ws.id === workspaceData.id
          ? { ...ws, ...workspaceData, updatedAt: new Date() }
          : ws
      );
      saveWorkspaces(updatedWorkspaces);
      toast.success("Workspace updated!");
    } else {
      // Create new workspace
      const newWorkspace: WorkspaceType = {
        ...workspaceData,
        id: `workspace-${Date.now()}`,
        boards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      saveWorkspaces([...workspaces, newWorkspace]);
      toast.success("Workspace created!");
    }
  };

  // Board and task management functions (same as before)
  const handleAddList = () => {
    if (!currentBoard) return;
    
    const newList: List = {
      id: `list-${Date.now()}`,
      title: "New List",
      tasks: [],
    };
    
    const updatedLists = [...lists, newList];
    setLists(updatedLists);
    updateCurrentBoard({ ...currentBoard, lists: updatedLists });
    toast.success("New list added!");
  };

  const updateCurrentBoard = (updatedBoard: Board) => {
    const updatedWorkspaces = workspaces.map(ws => 
      ws.id === currentWorkspace?.id
        ? { ...ws, boards: ws.boards.map(b => b.id === updatedBoard.id ? updatedBoard : b) }
        : ws
    );
    saveWorkspaces(updatedWorkspaces);
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
      const updatedLists = lists.map(list => ({
        ...list,
        tasks: list.tasks.map(task =>
          task.id === taskData.id
            ? { ...task, ...taskData, id: task.id, createdAt: task.createdAt }
            : task
        ),
      }));
      setLists(updatedLists);
      if (currentBoard) {
        updateCurrentBoard({ ...currentBoard, lists: updatedLists });
      }
      toast.success("Task updated!");
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
      };

      const updatedLists = lists.map(list =>
        list.id === taskDialog.listId
          ? { ...list, tasks: [...list.tasks, newTask] }
          : list
      );
      setLists(updatedLists);
      if (currentBoard) {
        updateCurrentBoard({ ...currentBoard, lists: updatedLists });
      }
      toast.success("Task created!");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedLists = lists.map(list => ({
      ...list,
      tasks: list.tasks.filter(task => task.id !== taskId),
    }));
    setLists(updatedLists);
    if (currentBoard) {
      updateCurrentBoard({ ...currentBoard, lists: updatedLists });
    }
    toast.success("Task deleted!");
  };

  const handleEditList = (list: List) => {
    toast.info("List editing coming soon!");
  };

  const handleDeleteList = (listId: string) => {
    const updatedLists = lists.filter(list => list.id !== listId);
    setLists(updatedLists);
    if (currentBoard) {
      updateCurrentBoard({ ...currentBoard, lists: updatedLists });
    }
    toast.success("List deleted!");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !currentBoard) return;

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
    const updatedLists = lists.map(list => {
      if (list.id === currentListId) {
        return { ...list, tasks: list.tasks.filter(t => t.id !== taskId) };
      }
      if (list.id === newListId) {
        return { ...list, tasks: [...list.tasks, task] };
      }
      return list;
    });

    setLists(updatedLists);
    updateCurrentBoard({ ...currentBoard, lists: updatedLists });
    toast.success("Task moved!");
  };

  if (!user) {
    return (
      <AuthDialog
        open={authDialog}
        onOpenChange={setAuthDialog}
        onLogin={handleLogin}
      />
    );
  }

  if (!currentBoard) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <WorkspaceSidebar
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onCreateWorkspace={handleCreateWorkspace}
            onEditWorkspace={handleEditWorkspace}
          />
          
          <div className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No Board Selected</h2>
              <p className="text-muted-foreground">
                {currentWorkspace?.boards.length === 0 
                  ? "This workspace doesn't have any boards yet."
                  : "Select a board from the sidebar to get started."
                }
              </p>
            </div>
          </div>
        </div>

        <WorkspaceDialog
          open={workspaceDialog.open}
          onOpenChange={(open) => setWorkspaceDialog({ open })}
          workspace={workspaceDialog.workspace}
          onSave={handleSaveWorkspace}
        />
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <WorkspaceSidebar
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onEditWorkspace={handleEditWorkspace}
        />
        
        <div className="flex-1 bg-board-bg">
          <div className="border-b bg-background">
            <div className="flex items-center px-4 py-2">
              <SidebarTrigger />
            </div>
          </div>
          
          <BoardHeader 
            title={currentBoard.title} 
            onAddList={handleAddList}
            user={user}
            onAuthClick={() => setAuthDialog(true)}
            onLogout={handleLogout}
          />
          
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

          <WorkspaceDialog
            open={workspaceDialog.open}
            onOpenChange={(open) => setWorkspaceDialog({ open })}
            workspace={workspaceDialog.workspace}
            onSave={handleSaveWorkspace}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Workspace;