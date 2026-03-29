import axios from 'axios';

export const createMealPlan = () => axios.post('/api/mealplans/create');