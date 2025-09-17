const { pool } = require('../config/database');

class List {
  constructor(listData) {
    this.id = listData.id;
    this.title = listData.title;
    this.board_id = listData.board_id;
    this.position = listData.position || 0;
  }

  async save() {
    try {
      const [result] = await pool.execute(
        'INSERT INTO lists (id, title, board_id, position) VALUES (?, ?, ?, ?)',
        [this.id, this.title, this.board_id, this.position]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update() {
    try {
      const [result] = await pool.execute(
        'UPDATE lists SET title = ?, position = ? WHERE id = ?',
        [this.title, this.position, this.id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lists WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByBoardId(boardId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM lists WHERE board_id = ? ORDER BY position ASC, created_at ASC',
        [boardId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM lists WHERE id = ?',
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
          'UPDATE lists SET position = ? WHERE id = ?',
          [update.position, update.id]
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

  static async exists(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM lists WHERE id = ?',
        [id]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = List;