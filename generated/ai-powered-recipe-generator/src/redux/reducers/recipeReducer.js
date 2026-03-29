const initialState = { recipes: [], error: null };

const recipeReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'RECIPE_GENERATED':
      return { ...state, recipes: action.payload, error: null };
    case 'RECIPE_GENERATION_FAILED':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default recipeReducer;