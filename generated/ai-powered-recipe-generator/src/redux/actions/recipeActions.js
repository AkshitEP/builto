import axios from 'axios';

export const generateRecipe = (ingredients) => async (dispatch) => {
  try {
    const response = await axios.post('/api/recipes/generate', { ingredients });
    dispatch({ type: 'RECIPE_GENERATED', payload: response.data });
  } catch (error) {
    dispatch({ type: 'RECIPE_GENERATION_FAILED', payload: error.message });
  }
};