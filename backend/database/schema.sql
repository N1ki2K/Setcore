-- Create database
CREATE DATABASE IF NOT EXISTS setcore_db;
USE setcore_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create refresh tokens table for JWT token management
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

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
CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX idx_workspaces_created_at ON workspaces(created_at);

CREATE INDEX idx_boards_workspace_id ON boards(workspace_id);
CREATE INDEX idx_boards_created_at ON boards(created_at);

CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_lists_position ON lists(position);

CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_position ON tasks(position);
CREATE INDEX idx_tasks_priority ON tasks(priority);