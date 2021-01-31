import {
    ADD_TODO,
    UPDATE_TODO_STATUS,
    CLEAR_COMPLETED
} from '../actions';

const INITIAL_STATE = [];

export const todoReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_TODO:
            return [...state, action.todo];
        case UPDATE_TODO_STATUS:
            return [
                ...state,

                state.map(todo =>
                    todo.id === action.todo.id
                        ? {...action.todo, complete: action.complete}
                        : todo
                )];
        case CLEAR_COMPLETED:
            return state.filter(todo => !todo.complete);
        default:
            return state;
    }
};
