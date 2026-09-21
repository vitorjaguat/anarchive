import React, { createContext, useReducer } from 'react';

// Initial state
const initialState = {
  openToken: 'initial',
  sort: 'From',
  view: 'graph',
  sortGrid: 'DESC',
  constellations: [],
};

// Reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_OPEN_TOKEN':
      return {
        ...state,
        openToken: action.payload,
      };
    case 'CHANGE_SORT':
      return {
        ...state,
        sort: action.payload,
      };
    case 'CHANGE_VIEW':
      return {
        ...state,
        view: action.payload,
      };
    case 'CHANGE_SORT_GRID':
      return {
        ...state,
        sortGrid: action.payload,
      };
    case 'CHANGE_CONSTELLATIONS':
      return {
        ...state,
        constellations: action.payload,
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

  // Function to change sort
  const changeSort = (sort) => {
    dispatch({
      type: 'CHANGE_SORT',
      payload: sort,
    });
  };

  // Function to change visualization
  const changeView = (view) => {
    dispatch({
      type: 'CHANGE_VIEW',
      payload: view,
    });
  };

  // Function to change grid sort order
  const changeSortGrid = (sortGrid) => {
    dispatch({
      type: 'CHANGE_SORT_GRID',
      payload: sortGrid,
    });
  };

  // Function to change selected constellations
  const changeConstellations = (constellations) => {
    dispatch({
      type: 'CHANGE_CONSTELLATIONS',
      payload: constellations,
    });
  };

  return (
    <MainContext.Provider
      value={{
        openToken: state.openToken,
        changeOpenToken,
        sort: state.sort,
        changeSort,
        view: state.view,
        changeView,
        sortGrid: state.sortGrid,
        changeSortGrid,
        constellations: state.constellations,
        changeConstellations,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export { MainContext, MainContextProvider };
