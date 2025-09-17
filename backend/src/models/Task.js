const { pool } = require('../config/database');

class Task {
  constructor(taskData) {
    this.id = taskData.id;
    this.title = taskData.title;
    this.description = taskData.description;
    this.priority = taskData.priority || 'medium';
    this.assignee = taskData.assignee;
    this.list_id = taskData.list_id;
    this.position = taskData.position || 0;
  }

  async save() {
    try {
      const [result] = await pool.execute(
        'INSERT INTO tasks (id, title, description, priority, assignee, list_id, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [this.id, this.title, this.description, this.priority, this.assignee, this.list_id, this.position]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update() {
    try {
      const [result] = await pool.execute(
        'UPDATE tasks SET title = ?, description = ?, priority = ?, assignee = ?, position = ? WHERE id = ?',
        [this.title, this.description, this.priority, this.assignee, this.position, this.id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByListId(listId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM tasks WHERE list_id = ? ORDER BY position ASC, created_at ASC',
        [listId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM tasks WHERE id = ?',
        [id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updatePositions(updates) {
    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      for (const update of updates) {
        await connection.execute(
          'UPDATE tasks SET position = ?, list_id = ? WHERE id = ?',
          [update.position, update.list_id, update.id]
        );
      }

      await connection.commit();
      connection.release();
      return true;
    } catch (error) {
      const connection = await pool.getConnection();
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  static async moveToList(taskId, newListId, newPosition) {
    try {
      const [result] = await pool.execute(
        'UPDATE tasks SET list_id = ?, position = ? WHERE id = ?',
        [newListId, newPosition, taskId]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async exists(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM tasks WHERE id = ?',
        [id]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Task;