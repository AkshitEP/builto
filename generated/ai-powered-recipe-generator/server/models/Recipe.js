const { Pool } = require('pg');
const pool = new Pool();

const Recipe = {
  create: async (recipeData) => {
    const { name, ingredients } = recipeData;
    const result = await pool.query('INSERT INTO recipes (name, ingredients) VALUES ($1, $2) RETURNING *', [name, ingredients]);
    return result.rows[0];
  }
};

module.exports = Recipe;