import { GLOBALTYPES } from '../actions/globalTypes'

const callReducer = (state = null, action: any) => {
    switch (action.type) {
        case GLOBALTYPES.CALL:
            return action.payload
        default:
            return state
    }
}

export default callReducer
