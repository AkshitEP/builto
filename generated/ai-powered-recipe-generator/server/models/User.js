const { Pool } = require('pg');
const pool = new Pool();

const User = {
  create: async (userData) => {
    const { email, password } = userData;
    const result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, password]);
    return result.rows[0];
  },
  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }
};

module.exports = User;