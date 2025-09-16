export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: Date;
}

export interface List {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  workspaceId: string;
  lists: List[];
  createdAt: Date;
}