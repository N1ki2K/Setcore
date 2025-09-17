const { pool } = require('../config/database');

class Workspace {
  constructor(workspaceData) {
    this.id = workspaceData.id;
    this.name = workspaceData.name;
    this.description = workspaceData.description;
    this.color = workspaceData.color || '#3b82f6';
    this.user_id = workspaceData.user_id;
  }

  async save() {
    try {
      const [result] = await pool.execute(
        'INSERT INTO workspaces (id, name, description, color, user_id) VALUES (?, ?, ?, ?, ?)',
        [this.id, this.name, this.description, this.color, this.user_id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update() {
    try {
      const [result] = await pool.execute(
        'UPDATE workspaces SET name = ?, description = ?, color = ? WHERE id = ?',
        [this.name, this.description, this.color, this.id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM workspaces WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM workspaces WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM workspaces WHERE id = ?',
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
        'SELECT id FROM workspaces WHERE id = ?',
        [id]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Workspace;