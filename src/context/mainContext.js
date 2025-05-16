import React, { createContext, useReducer } from 'react';

// Initial state
const initialState = {
  openToken: 'initial',
};

// Reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_OPEN_TOKEN':
      return {
        ...state,
        openToken: action.payload,
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
  const changeOpenToken = (token) => {
    dispatch({
      type: 'CHANGE_OPEN_TOKEN',
      payload: token,
    });
  };

  return (
    <MainContext.Provider
      value={{ openToken: state.openToken, changeOpenToken }}
    >
      {children}
    </MainContext.Provider>
  );
};

export { MainContext, MainContextProvider };
