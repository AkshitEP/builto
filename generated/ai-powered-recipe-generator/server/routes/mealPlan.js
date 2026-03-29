const express = require('express');
const router = express.Router();
const { createMealPlan } = require('../controllers/mealPlanController');

router.post('/mealplans/create', createMealPlan);

module.exports = router;