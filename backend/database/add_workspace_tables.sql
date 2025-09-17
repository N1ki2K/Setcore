USE setcore_db;

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6',
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  workspace_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  board_id VARCHAR(255) NOT NULL,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  assignee VARCHAR(100),
  list_id VARCHAR(255) NOT NULL,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_at ON workspaces(created_at);

CREATE INDEX IF NOT EXISTS idx_boards_workspace_id ON boards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_boards_created_at ON boards(created_at);

CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_lists_position ON lists(position);

CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);