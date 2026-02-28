import { combineReducers, legacy_createStore } from "redux"
import userReducer from "./user/userReducer";

const rootReducer = combineReducers({
    userReducer
});

export const store = legacy_createStore(rootReducer);