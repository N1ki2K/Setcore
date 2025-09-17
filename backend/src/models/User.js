const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
  }

  async save() {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 12);
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
        [this.username, this.email, hashedPassword, this.first_name, this.last_name]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
        [username]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, first_name, last_name, created_at, updated_at, last_login FROM users WHERE id = ? AND is_active = TRUE',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async updateLastLogin(id) {
    try {
      await pool.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async emailExists(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async usernameExists(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;