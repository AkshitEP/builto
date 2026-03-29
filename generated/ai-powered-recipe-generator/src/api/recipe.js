import axios from 'axios';

export const generateRecipe = (ingredients) => axios.post('/api/recipes/generate', { ingredients });