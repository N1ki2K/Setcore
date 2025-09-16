import { Board } from './board';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color?: string;
  boards: Board[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  workspaces: string[]; // workspace IDs
}