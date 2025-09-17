const { pool } = require('../config/database');

class Board {
  constructor(boardData) {
    this.id = boardData.id;
    this.title = boardData.title;
    this.description = boardData.description;
    this.workspace_id = boardData.workspace_id;
  }

  async save() {
    try {
      const [result] = await pool.execute(
        'INSERT INTO boards (id, title, description, workspace_id) VALUES (?, ?, ?, ?)',
        [this.id, this.title, this.description, this.workspace_id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update() {
    try {
      const [result] = await pool.execute(
        'UPDATE boards SET title = ?, description = ? WHERE id = ?',
        [this.title, this.description, this.id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM boards WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByWorkspaceId(workspaceId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM boards WHERE workspace_id = ? ORDER BY created_at DESC',
        [workspaceId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM boards WHERE id = ?',
        [id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async exists(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM boards WHERE id = ?',
        [id]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Board;