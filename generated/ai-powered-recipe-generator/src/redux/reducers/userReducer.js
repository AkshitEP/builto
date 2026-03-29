const initialState = { user: null, error: null };

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, error: action.payload };
    case 'REGISTER_SUCCESS':
      return { ...state, user: action.payload, error: null };
    case 'REGISTER_FAILURE':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default userReducer;