import { GLOBALTYPES } from '../actions/globalTypes'

const initialState = {}

const alertReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GLOBALTYPES.ALERT:
            return action.payload
        default:
            return state
    }
}

export default alertReducer
