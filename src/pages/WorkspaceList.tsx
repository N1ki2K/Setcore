import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Folder, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import WorkspaceDialog from "@/components/WorkspaceDialog";
import AuthDialog from "@/components/AuthDialog";
import { Workspace } from "@/types/workspace";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const WorkspaceList = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceDialog, setWorkspaceDialog] = useState<{
    open: boolean;
    workspace?: Workspace | null;
  }>({ open: false });
  const [authDialog, setAuthDialog] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Check for existing user session and load workspaces
  useEffect(() => {
    const savedUser = localStorage.getItem('taskboard_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadWorkspaces();
    }
  }, []);

  const loadWorkspaces = () => {
    const savedWorkspaces = localStorage.getItem('taskboard_workspaces');
    if (savedWorkspaces) {
      setWorkspaces(JSON.parse(savedWorkspaces));
    } else {
      // Create default workspace
      const defaultWorkspace: Workspace = {
        id: 'default',
        name: 'My Workspace',
        description: 'Default workspace for your projects',
        color: '#3b82f6',
        boards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setWorkspaces([defaultWorkspace]);
      localStorage.setItem('taskboard_workspaces', JSON.stringify([defaultWorkspace]));
    }
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    loadWorkspaces();
  };

  const handleLogout = () => {
    localStorage.removeItem('taskboard_user');
    setUser(null);
    setWorkspaces([]);
    toast.success("Logged out successfully!");
  };

  const handleCreateWorkspace = () => {
    if (!user) {
      setAuthDialog(true);
      return;
    }
    setWorkspaceDialog({ open: true });
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setWorkspaceDialog({ open: true, workspace });
  };

  const handleSaveWorkspace = (workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'boards'> & { id?: string }) => {
    if (workspaceData.id) {
      // Edit existing workspace
      const updatedWorkspaces = workspaces.map(ws =>
        ws.id === workspaceData.id
          ? { ...ws, ...workspaceData, updatedAt: new Date() }
          : ws
      );
      setWorkspaces(updatedWorkspaces);
      localStorage.setItem('taskboard_workspaces', JSON.stringify(updatedWorkspaces));
      toast.success("Workspace updated!");
    } else {
      // Create new workspace
      const newWorkspace: Workspace = {
        ...workspaceData,
        id: `workspace-${Date.now()}`,
        boards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedWorkspaces = [...workspaces, newWorkspace];
      setWorkspaces(updatedWorkspaces);
      localStorage.setItem('taskboard_workspaces', JSON.stringify(updatedWorkspaces));
      toast.success("Workspace created!");
    }
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    const updatedWorkspaces = workspaces.filter(ws => ws.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);
    localStorage.setItem('taskboard_workspaces', JSON.stringify(updatedWorkspaces));
    toast.success("Workspace deleted!");
  };

  const handleWorkspaceClick = (workspaceId: string) => {
    navigate(`/workspace/${workspaceId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome to TaskBoard</h1>
            <p className="text-muted-foreground">
              Organize your projects with workspaces, boards, and tasks
            </p>
          </div>
          <Button onClick={() => setAuthDialog(true)} size="lg">
            Get Started
          </Button>
        </div>
        
        <AuthDialog
          open={authDialog}
          onOpenChange={setAuthDialog}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Workspaces</h1>
            <p className="text-muted-foreground">Organize your projects and collaborate with your team</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={handleCreateWorkspace}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem className="flex items-center">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Workspaces Grid */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Card 
              key={workspace.id} 
              className="p-6 hover:shadow-card-hover transition-shadow cursor-pointer group"
              onClick={() => handleWorkspaceClick(workspace.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: workspace.color || '#3b82f6' }}
                  />
                  <h3 className="font-semibold">{workspace.name}</h3>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditWorkspace(workspace);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkspace(workspace.id);
                      }}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {workspace.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {workspace.description}
                </p>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Folder className="w-4 h-4" />
                <span>{workspace.boards.length} boards</span>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <WorkspaceDialog
        open={workspaceDialog.open}
        onOpenChange={(open) => setWorkspaceDialog({ open })}
        workspace={workspaceDialog.workspace}
        onSave={handleSaveWorkspace}
        onDelete={handleDeleteWorkspace}
      />
    </div>
  );
};

export default WorkspaceList;