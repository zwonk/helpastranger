import { createStore, applyMiddleware } from 'redux';
import thunk from "redux-thunk" 
import rootReducer from './rootReducer.js';
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(
    rootReducer,
    applyMiddleware(thunk),
    composeWithDevTools(),
);


export default store;