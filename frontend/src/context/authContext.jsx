import { createContext, useEffect, useReducer } from "react";

const initialState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    role: localStorage.getItem('role') || null,
    token: localStorage.getItem('token') || null
};

export const authContext = createContext(initialState);

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                user: null,
                role: null,
                token: null
            };
        case 'LOGIN_SUCCESS':
            // Update localStorage directly in the reducer
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.accessToken);
            localStorage.setItem('role', action.payload.role);
            return {
                user: action.payload.user,
                role: action.payload.role,
                token: action.payload.accessToken
            };
        case 'LOGOUT':
            // Clear localStorage when logging out
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            return {
                user: null,
                role: null,
                token: null
            };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    return (
        <authContext.Provider value={{ ...state, dispatch }}>
            {children}
        </authContext.Provider>
    );
};
