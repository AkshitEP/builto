const { Pool } = require('pg');
const pool = new Pool();

const MealPlan = {
  create: async (mealPlanData) => {
    const { userId, recipes } = mealPlanData;
    const result = await pool.query('INSERT INTO meal_plans (user_id, recipes) VALUES ($1, $2) RETURNING *', [userId, recipes]);
    return result.rows[0];
  }
};

module.exports = MealPlan;