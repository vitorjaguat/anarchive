import React, { createContext, useReducer } from 'react';

// Initial state
const initialState = {
  currentTokens: [],
};

// Reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_TOKENS':
      return {
        ...state,
        currentTokens: action.payload,
      };
    default:
      return state;
  }
};

// Create the context
const MainContext = createContext();

// Context provider component
const MainContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Function to change tokens
  const changeTokens = (newTokens) => {
    dispatch({
      type: 'CHANGE_TOKENS',
      payload: newTokens,
    });
  };

  return (
    <MainContext.Provider
      value={{ currentTokens: state.currentTokens, changeTokens }}
    >
      {children}
    </MainContext.Provider>
  );
};

export { MainContext, MainContextProvider };
