import { GLOBALTYPES } from '../actions/globalTypes'

const initialState = false

const modalReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GLOBALTYPES.MODAL:
            return action.payload
        default:
            return state
    }
}

export default modalReducer
