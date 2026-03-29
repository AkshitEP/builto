const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipe');
const mealPlanRoutes = require('./routes/mealPlan');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', userRoutes);
app.use('/api', recipeRoutes);
app.use('/api', mealPlanRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});