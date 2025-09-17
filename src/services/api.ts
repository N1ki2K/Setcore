const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request<{ user: any }>('/auth/profile');
  }

  async verifyToken() {
    return this.request<{ user: any }>('/auth/verify');
  }

  // Workspace methods
  async getWorkspaces() {
    return this.request<any[]>('/workspaces');
  }

  async getWorkspace(id: string) {
    return this.request<any>(`/workspaces/${id}`);
  }

  async createWorkspace(workspaceData: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  }) {
    return this.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspaceData),
    });
  }

  async updateWorkspace(id: string, workspaceData: {
    name: string;
    description?: string;
    color?: string;
  }) {
    return this.request(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workspaceData),
    });
  }

  async deleteWorkspace(id: string) {
    return this.request(`/workspaces/${id}`, {
      method: 'DELETE',
    });
  }

  // Board methods
  async getBoards(workspaceId: string) {
    return this.request<any[]>(`/boards/workspace/${workspaceId}`);
  }

  async getBoard(id: string) {
    return this.request<any>(`/boards/${id}`);
  }

  async createBoard(boardData: {
    id: string;
    title: string;
    description?: string;
    workspace_id: string;
  }) {
    return this.request('/boards', {
      method: 'POST',
      body: JSON.stringify(boardData),
    });
  }

  async updateBoard(id: string, boardData: {
    title: string;
    description?: string;
  }) {
    return this.request(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(boardData),
    });
  }

  async deleteBoard(id: string) {
    return this.request(`/boards/${id}`, {
      method: 'DELETE',
    });
  }

  // List methods
  async getLists(boardId: string) {
    return this.request<any[]>(`/lists/board/${boardId}`);
  }

  async getList(id: string) {
    return this.request<any>(`/lists/${id}`);
  }

  async createList(listData: {
    id: string;
    title: string;
    board_id: string;
    position?: number;
  }) {
    return this.request('/lists', {
      method: 'POST',
      body: JSON.stringify(listData),
    });
  }

  async updateList(id: string, listData: {
    title: string;
    position?: number;
  }) {
    return this.request(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listData),
    });
  }

  async updateListPositions(updates: { id: string; position: number }[]) {
    return this.request('/lists/positions/batch', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async deleteList(id: string) {
    return this.request(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  // Task methods
  async getTasks(listId: string) {
    return this.request<any[]>(`/tasks/list/${listId}`);
  }

  async getTask(id: string) {
    return this.request<any>(`/tasks/${id}`);
  }

  async createTask(taskData: {
    id: string;
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
    list_id: string;
    position?: number;
  }) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, taskData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    assignee?: string;
    position?: number;
  }) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async updateTaskPositions(updates: { id: string; position: number; list_id: string }[]) {
    return this.request('/tasks/positions/batch', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async moveTask(id: string, newListId: string, position?: number) {
    return this.request(`/tasks/${id}/move`, {
      method: 'PUT',
      body: JSON.stringify({
        new_list_id: newListId,
        position
      }),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();