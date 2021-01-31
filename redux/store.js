import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducer  from './reducers';

// ES5
/*
* var obj = {
    id: 42,
    counter: function counter() {
        // Function scope / execution scope
        setTimeout(function() {
            console.log(this.id);
        }.bind(this), 1000);
    }
};

obj.counter();
* */

const logger = ({getState}) => {
    //  block Scope / Lexical scope
    return next => action => {
        /*
        *   LOGGER
        *   action
        *   session Data (device, IP, username, rol, auth)
        *   date (where, when)
        *   REDIS para guardar estos logs.
        * */
        console.log('will dispatch', action);

        // Call the next dispatch method in the middleware chain.
        const returnValue = next(action);

        console.log('state after dispatch', getState());

        // This will likely be the action itself, unless
        // a middleware further in chain changed it.
        return returnValue;
    }
};

export const store = createStore(
    reducer,
    {},
    applyMiddleware(thunk, logger)
    );
