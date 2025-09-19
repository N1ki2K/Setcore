import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BoardHeader from "@/components/BoardHeader";
import BoardList from "@/components/BoardList";
import TaskDialog from "@/components/TaskDialog";
import AuthDialog from "@/components/AuthDialog";
import ListDialog from "@/components/ListDialog";
import BoardDialog from "@/components/BoardDialog";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import WorkspaceDialog from "@/components/WorkspaceDialog";
import AppHeader from "@/components/AppHeader";
import { Board, List, Task } from "@/types/board";
import { Workspace as WorkspaceType } from "@/types/workspace";
import { apiService } from "@/services/api";

const Workspace = () => {
  const { workspaceId, boardId } = useParams();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType | null>(null);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [taskDialog, setTaskDialog] = useState<{
    open: boolean;
    task?: Task | null;
    listId?: string;
  }>({ open: false });

  const [workspaceDialog, setWorkspaceDialog] = useState<{
    open: boolean;
    workspace?: WorkspaceType | null;
  }>({ open: false });

  const [listDialog, setListDialog] = useState<{
    open: boolean;
    list?: List | null;
  }>({ open: false });

  const [boardDialog, setBoardDialog] = useState<{
    open: boolean;
    board?: Board | null;
  }>({ open: false });

  // Load user and workspaces on mount
  useEffect(() => {
    loadUserAndWorkspaces();
  }, []);

  // Load specific workspace when workspaceId changes
  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      loadWorkspace();
    }
  }, [workspaceId, workspaces]);

  // Load specific board when boardId changes
  useEffect(() => {
    if (boardId && currentWorkspace) {
      loadBoard();
    }
  }, [boardId, currentWorkspace]);

  const loadUserAndWorkspaces = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setAuthDialogOpen(true);
        setLoading(false);
        return;
      }

      // Verify token and get user
      const userResponse = await apiService.verifyToken();
      const userData = userResponse.data?.user || userResponse.user;
      setUser({
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username,
        email: userData.email
      });

      // Load workspaces
      const workspacesData = await apiService.getWorkspaces();
      setWorkspaces(workspacesData);

      // If no workspaces exist, create a default one
      if (workspacesData.length === 0) {
        await createDefaultWorkspace();
      } else if (!workspaceId) {
        // If no workspace selected, navigate to the first one
        navigate(`/workspace/${workspacesData[0].id}`);
      }
    } catch (error) {
      console.error('Failed to load user and workspaces:', error);
      localStorage.removeItem('token');
      setAuthDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultWorkspace = async () => {
    try {
      const defaultWorkspace = {
        id: `workspace-${Date.now()}`,
        name: "My Workspace",
        description: "Welcome to your first workspace!",
        color: "#3b82f6"
      };

      await apiService.createWorkspace(defaultWorkspace);
      const workspacesData = await apiService.getWorkspaces();
      setWorkspaces(workspacesData);
      navigate(`/workspace/${defaultWorkspace.id}`);
      toast.success("Welcome! Your first workspace has been created.");
    } catch (error) {
      console.error('Failed to create default workspace:', error);
      toast.error('Failed to create workspace');
    }
  };

  const loadWorkspace = async () => {
    if (!workspaceId) return;

    try {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);

        // Load boards for this workspace
        const boardsData = await apiService.getBoards(workspaceId);

        // Update workspace with boards
        const workspaceWithBoards = {
          ...workspace,
          boards: boardsData.map((board: any) => ({
            id: board.id,
            title: board.title,
            description: board.description,
            workspaceId: board.workspace_id,
            lists: [],
            createdAt: new Date(board.created_at)
          }))
        };

        setCurrentWorkspace(workspaceWithBoards);
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
      toast.error('Failed to load workspace');
    }
  };

  const loadBoard = async () => {
    if (!boardId || !currentWorkspace) return;

    try {
      const board = currentWorkspace.boards?.find(b => b.id === boardId);
      if (board) {
        // Load lists for this board
        const listsData = await apiService.getLists(boardId);

        // Load tasks for each list
        const listsWithTasks = await Promise.all(
          listsData.map(async (list: any) => {
            const tasksData = await apiService.getTasks(list.id);
            return {
              id: list.id,
              title: list.title,
              boardId: list.board_id,
              position: list.position,
              tasks: tasksData.map((task: any) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                assignee: task.assignee,
                listId: task.list_id,
                position: task.position,
                createdAt: new Date(task.created_at)
              }))
            };
          })
        );

        const boardWithLists = {
          ...board,
          lists: listsWithTasks
        };

        setCurrentBoard(boardWithLists);
        setLists(listsWithTasks);
      }
    } catch (error) {
      console.error('Failed to load board:', error);
      toast.error('Failed to load board');
    }
  };

  const handleCreateWorkspace = async (workspaceData: { name: string; description?: string; color?: string }) => {
    try {
      const { name, description, color } = workspaceData;
      const newWorkspace = {
        id: `workspace-${Date.now()}`,
        name,
        description,
        color
      };

      await apiService.createWorkspace(newWorkspace);
      const workspacesData = await apiService.getWorkspaces();
      setWorkspaces(workspacesData);
      toast.success("Workspace created successfully");
    } catch (error) {
      console.error('Failed to create workspace:', error);
      toast.error('Failed to create workspace');
    }
  };

  const handleUpdateWorkspace = async (workspaceData: { id?: string; name: string; description?: string; color?: string }) => {
    if (!workspaceData.id) return;

    try {
      await apiService.updateWorkspace(workspaceData.id, {
        name: workspaceData.name,
        description: workspaceData.description,
        color: workspaceData.color
      });

      const workspacesData = await apiService.getWorkspaces();
      setWorkspaces(workspacesData);

      if (currentWorkspace?.id === workspaceData.id) {
        setCurrentWorkspace(prev => prev ? { ...prev, ...workspaceData } : null);
      }

      toast.success("Workspace updated successfully");
    } catch (error) {
      console.error('Failed to update workspace:', error);
      toast.error('Failed to update workspace');
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      await apiService.deleteWorkspace(workspaceId);
      const workspacesData = await apiService.getWorkspaces();
      setWorkspaces(workspacesData);

      if (currentWorkspace?.id === workspaceId) {
        if (workspacesData.length > 0) {
          navigate(`/workspace/${workspacesData[0].id}`);
        } else {
          // If no workspaces left, clear current workspace but stay logged in
          setCurrentWorkspace(null);
          setCurrentBoard(null);
          setLists([]);
          // Stay on current URL, the UI will show "create workspace" options
        }
      }

      toast.success("Workspace deleted successfully");
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      toast.error('Failed to delete workspace');
    }
  };

  const handleCreateBoard = async () => {
    if (!currentWorkspace) return;

    try {
      const newBoard = {
        id: `board-${Date.now()}`,
        title: "New Board",
        description: "A new board for organizing tasks",
        workspace_id: currentWorkspace.id
      };

      await apiService.createBoard(newBoard);

      // Reload workspace data
      await loadWorkspace();

      navigate(`/workspace/${currentWorkspace.id}/board/${newBoard.id}`);
      toast.success("Board created successfully");
    } catch (error) {
      console.error('Failed to create board:', error);
      toast.error('Failed to create board');
    }
  };

  const handleEditBoard = (board: Board) => {
    setBoardDialog({ open: true, board });
  };

  const handleSaveBoard = async (boardData: { id?: string; title: string; description?: string }) => {
    try {
      if (boardData.id) {
        // Update existing board
        await apiService.updateBoard(boardData.id, {
          title: boardData.title,
          description: boardData.description
        });

        // Reload workspace data
        await loadWorkspace();

        if (currentBoard?.id === boardData.id) {
          setCurrentBoard(prev => prev ? { ...prev, title: boardData.title, description: boardData.description } : null);
        }

        toast.success("Board updated successfully");
      }
    } catch (error) {
      console.error('Failed to save board:', error);
      toast.error('Failed to save board');
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await apiService.deleteBoard(boardId);

      // Reload workspace data
      await loadWorkspace();

      if (currentBoard?.id === boardId) {
        navigate(`/workspace/${currentWorkspace?.id}`);
      }

      toast.success("Board deleted successfully");
    } catch (error) {
      console.error('Failed to delete board:', error);
      toast.error('Failed to delete board');
    }
  };

  const handleAddList = async () => {
    if (!currentBoard) return;

    try {
      const newList = {
        id: `list-${Date.now()}`,
        title: "New List",
        board_id: currentBoard.id,
        position: lists.length
      };

      await apiService.createList(newList);

      // Reload board data
      await loadBoard();

      toast.success("List created successfully");
    } catch (error) {
      console.error('Failed to create list:', error);
      toast.error('Failed to create list');
    }
  };

  const handleEditList = (list: List) => {
    setListDialog({ open: true, list });
  };

  const handleSaveList = async (listData: { id?: string; title: string }) => {
    try {
      if (listData.id) {
        // Update existing list
        await apiService.updateList(listData.id, { title: listData.title });

        // Reload board data
        await loadBoard();

        toast.success("List updated successfully");
      }
    } catch (error) {
      console.error('Failed to save list:', error);
      toast.error('Failed to save list');
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await apiService.deleteList(listId);

      // Reload board data
      await loadBoard();

      toast.success("List deleted successfully");
    } catch (error) {
      console.error('Failed to delete list:', error);
      toast.error('Failed to delete list');
    }
  };

  const handleAddTask = (listId: string) => {
    setTaskDialog({ open: true, listId });
  };

  const handleEditTask = (task: Task) => {
    setTaskDialog({ open: true, task });
  };

  const handleSaveTask = async (taskData: {
    id?: string;
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    assignee?: string;
    listId?: string;
  }) => {
    try {
      if (taskData.id) {
        // Update existing task
        await apiService.updateTask(taskData.id, {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          assignee: taskData.assignee
        });
      } else if (taskData.listId) {
        // Create new task
        const list = lists.find(l => l.id === taskData.listId);
        const newTask = {
          id: `task-${Date.now()}`,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || 'medium' as const,
          assignee: taskData.assignee,
          list_id: taskData.listId,
          position: list?.tasks?.length || 0
        };

        await apiService.createTask(newTask);
      }

      // Reload board data
      await loadBoard();

      toast.success(taskData.id ? "Task updated successfully" : "Task created successfully");
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);

      // Reload board data
      await loadBoard();

      toast.success("Task deleted successfully");
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    try {
      // Handle task drag and drop
      if (active.id.toString().startsWith('task-')) {
        const taskId = active.id as string;
        const targetListId = over.id as string;

        // Find the task and target list
        const task = lists.flatMap(l => l.tasks).find(t => t.id === taskId);
        const targetList = lists.find(l => l.id === targetListId);

        if (!task || !targetList) return;

        // If moving to a different list
        if (task.listId !== targetListId) {
          await apiService.moveTask(taskId, targetListId, targetList.tasks.length);
          await loadBoard(); // Reload to get updated positions
          toast.success("Task moved successfully");
        }
      }
    } catch (error) {
      console.error('Failed to move task:', error);
      toast.error('Failed to move task');
    }
  };

  const handleAuthSuccess = (userData: { token: string; user: any }) => {
    localStorage.setItem('token', userData.token);
    setUser({
      name: `${userData.user.first_name || ''} ${userData.user.last_name || ''}`.trim() || userData.user.username,
      email: userData.user.email
    });
    setAuthDialogOpen(false);
    loadUserAndWorkspaces();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    setCurrentBoard(null);
    setLists([]);
    navigate('/');
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          onSuccess={handleAuthSuccess}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Welcome to Setcore</h1>
            <p className="text-xl text-muted-foreground">Please sign in to continue</p>
            <Button onClick={() => setAuthDialogOpen(true)} size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex flex-col h-screen">
          <AppHeader user={user} onLogout={handleLogout} />

          <div className="flex flex-1 overflow-hidden">
            <WorkspaceSidebar
              workspaces={workspaces}
              currentWorkspace={currentWorkspace}
              onCreateWorkspace={() => setWorkspaceDialog({ open: true })}
              onEditWorkspace={(workspace) => setWorkspaceDialog({ open: true, workspace })}
              onCreateBoard={handleCreateBoard}
              onEditBoard={handleEditBoard}
            />

            <div className="flex-1 flex flex-col overflow-hidden">

            {currentBoard ? (
              <>
                <BoardHeader
                  title={currentBoard.title}
                  onAddList={handleAddList}
                  onEditBoard={() => handleEditBoard(currentBoard)}
                  user={user}
                  onAuthClick={() => setAuthDialogOpen(true)}
                  onLogout={handleLogout}
                />

                <main className="flex-1 overflow-auto p-6">
                  <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    <div className="flex space-x-4 h-full">
                      {lists.map((list) => (
                        <BoardList
                          key={list.id}
                          list={list}
                          onAddTask={() => handleAddTask(list.id)}
                          onEditTask={handleEditTask}
                          onEditList={() => handleEditList(list)}
                        />
                      ))}
                    </div>
                  </DndContext>
                </main>
              </>
            ) : (
              <main className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-6 max-w-md">
                  <h2 className="text-3xl font-bold text-foreground">
                    {currentWorkspace ? `Welcome to ${currentWorkspace.name}` : "Select a Workspace"}
                  </h2>

                  {currentWorkspace ? (
                    <div className="space-y-4">
                      <p className="text-lg text-muted-foreground">
                        {currentWorkspace.description || "Create or select a board to get started"}
                      </p>
                      {(!currentWorkspace.boards || currentWorkspace.boards.length === 0) ? (
                        <div className="space-y-4">
                          <p className="text-muted-foreground">No boards yet. Create your first board!</p>
                          <Button onClick={handleCreateBoard} size="lg">
                            Create Board
                          </Button>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Select a board from the sidebar to continue</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workspaces.length === 0 ? (
                        <>
                          <p className="text-lg text-muted-foreground">
                            You don't have any workspaces yet. Create your first workspace to get started!
                          </p>
                          <Button onClick={() => setWorkspaceDialog({ open: true })} size="lg">
                            Create Workspace
                          </Button>
                        </>
                      ) : (
                        <p className="text-lg text-muted-foreground">
                          Choose a workspace from the sidebar to begin organizing your work
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </main>
            )}
          </div>
        </div>

        {/* Dialogs */}
        <TaskDialog
          open={taskDialog.open}
          onOpenChange={(open) => setTaskDialog({ open })}
          task={taskDialog.task}
          listId={taskDialog.listId}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />

        <WorkspaceDialog
          open={workspaceDialog.open}
          onOpenChange={(open) => setWorkspaceDialog({ open })}
          workspace={workspaceDialog.workspace}
          onSave={workspaceDialog.workspace ? handleUpdateWorkspace : handleCreateWorkspace}
          onDelete={handleDeleteWorkspace}
        />

        <ListDialog
          open={listDialog.open}
          onOpenChange={(open) => setListDialog({ open })}
          list={listDialog.list}
          onSave={handleSaveList}
          onDelete={handleDeleteList}
        />

        <BoardDialog
          open={boardDialog.open}
          onOpenChange={(open) => setBoardDialog({ open })}
          board={boardDialog.board}
          onSave={handleSaveBoard}
          onDelete={handleDeleteBoard}
        />

        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          onSuccess={handleAuthSuccess}
        />
      </SidebarProvider>
    </div>
  );
};

export default Workspace;