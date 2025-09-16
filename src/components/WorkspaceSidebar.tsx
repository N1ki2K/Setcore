import { useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { 
  Folder, 
  Plus, 
  Settings, 
  Briefcase,
  MoreHorizontal 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/types/workspace";

interface WorkspaceSidebarProps {
  workspaces: Workspace[];
  currentWorkspace?: Workspace;
  onCreateWorkspace: () => void;
  onEditWorkspace: (workspace: Workspace) => void;
}

export function WorkspaceSidebar({ 
  workspaces, 
  currentWorkspace, 
  onCreateWorkspace,
  onEditWorkspace 
}: WorkspaceSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const { workspaceId } = useParams();

  const isCollapsed = state === "collapsed";

  const getNavClass = (isActive: boolean) =>
    isActive 
      ? "bg-accent text-accent-foreground font-medium" 
      : "hover:bg-accent/50";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent className="p-2">
        {/* Current Workspace Header */}
        {currentWorkspace && (
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: currentWorkspace.color || '#3b82f6' }}
                />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {currentWorkspace.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentWorkspace.boards.length} boards
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditWorkspace(currentWorkspace)}
                  className="h-6 w-6 p-0"
                >
                  <Settings className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Boards in Current Workspace */}
        {currentWorkspace && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              Boards
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => {/* TODO: Add board creation */}}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {currentWorkspace.boards.map((board) => (
                  <SidebarMenuItem key={board.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/workspace/${currentWorkspace.id}/board/${board.id}`}
                        className={({ isActive }) => getNavClass(isActive)}
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        {!isCollapsed && <span className="truncate">{board.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* All Workspaces */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            Workspaces
            {!isCollapsed && (
              <Button
                variant="ghost" 
                size="sm"
                className="h-5 w-5 p-0"
                onClick={onCreateWorkspace}
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaces.map((workspace) => (
                <SidebarMenuItem key={workspace.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/workspace/${workspace.id}`}
                      className={({ isActive }) => getNavClass(isActive)}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: workspace.color || '#3b82f6' }}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{workspace.name}</span>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}