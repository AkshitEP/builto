import axios from 'axios';

export const createMealPlan = () => async (dispatch) => {
  try {
    const response = await axios.post('/api/mealplans/create');
    dispatch({ type: 'MEAL_PLAN_CREATED', payload: response.data });
  } catch (error) {
    dispatch({ type: 'MEAL_PLAN_CREATION_FAILED', payload: error.message });
  }
};