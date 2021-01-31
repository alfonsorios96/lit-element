import {
    UPDATE_FILTER
} from '../actions';

export const VisibilityFilters = {
    SHOW_ALL: 'All',
    SHOW_ACTIVE: 'Active',
    SHOW_COMPLETED: 'Completed'
};

const INITIAL_STATE = VisibilityFilters.SHOW_ALL;

export const filterReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case UPDATE_FILTER:
            return action.filter;
        default:
            return state;
    }
};
