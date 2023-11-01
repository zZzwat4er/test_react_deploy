import React from 'react'
import { createContext, useReducer } from "react";

export const AuthContext = createContext();

export const authReduser = (state, action) => {
    switch (action.type) {
        case 'LOGED':
            return { user: action.payload };
        case 'UNLOGED':
            return { user: null };
        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }) => {
    var user = null;
    if (window?.Telegram?.WebApp.initData.trim() !== '') {
        user = window.Telegram.WebApp.initDataUnsafe.user
    }

    user = {id : 651592824}
    const [state, dispatch] = useReducer(authReduser, {
        user: user
    })

    console.log('State: ', state);
    return <AuthContext.Provider value={{ ...state, dispatch }}>
        {children}
    </AuthContext.Provider>
}