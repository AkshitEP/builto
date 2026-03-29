const initialState = { mealPlans: [], error: null };

const mealPlanReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'MEAL_PLAN_CREATED':
      return { ...state, mealPlans: [...state.mealPlans, action.payload], error: null };
    case 'MEAL_PLAN_CREATION_FAILED':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default mealPlanReducer;