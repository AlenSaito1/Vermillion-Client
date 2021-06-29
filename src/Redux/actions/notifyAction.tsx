import { GLOBALTYPES } from './globalTypes'
import {
    postDataAPI,
    deleteDataAPI,
    getDataAPI,
    patchDataAPI,
} from '../../utils/fetchData'
import Socket from 'socket.io-client'
export enum NOTIFY_TYPES {
    GET_NOTIFIES = 'GET_NOTIFIES',
    CREATE_NOTIFY = 'CREATE_NOTIFY',
    REMOVE_NOTIFY = 'REMOVE_NOTIFY',
    UPDATE_NOTIFY = 'UPDATE_NOTIFY',
    UPDATE_SOUND = 'UPDATE_SOUND',
    DELETE_ALL_NOTIFIES = 'DELETE_ALL_NOTIFIES',
}

export const createNotify =
    ({
        msg,
        auth,
        socket,
    }: {
        msg: { id: string; url: string }
        auth: { user: { username: string; avatar: string }; token: string }
        socket: Socket.Socket
    }) =>
    async (dispatch: any) => {
        try {
            const res = await postDataAPI('notify', msg, auth.token)

            socket.emit('createNotify', {
                ...res.data.notify,
                user: {
                    username: auth.user.username,
                    avatar: auth.user.avatar,
                },
            })
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }

export const removeNotify =
    ({
        msg,
        auth,
        socket,
    }: {
        msg: { id: string; url: string }
        auth: { user: { username: string; avatar: string }; token: string }
        socket: Socket.Socket
    }) =>
    async (dispatch: any) => {
        try {
            await deleteDataAPI(`notify/${msg.id}?url=${msg.url}`, auth.token)

            socket.emit('removeNotify', msg)
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }

export const getNotifies = (token: string) => async (dispatch: any) => {
    try {
        const res = await getDataAPI('notifies', token)

        dispatch({ type: NOTIFY_TYPES.GET_NOTIFIES, payload: res.data.notifies })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: (err as any).response.data.msg },
        })
    }
}

export const isReadNotify =
    ({ msg, auth }: { msg: { _id: string; url: string }; auth: { token: string } }) =>
    async (dispatch: any) => {
        dispatch({ type: NOTIFY_TYPES.UPDATE_NOTIFY, payload: { ...msg, isRead: true } })
        try {
            await patchDataAPI(`/isReadNotify/${msg._id}`, null, auth.token)
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }

export const deleteAllNotifies = (token: string) => async (dispatch: any) => {
    dispatch({ type: NOTIFY_TYPES.DELETE_ALL_NOTIFIES, payload: [] })
    try {
        await deleteDataAPI('deleteAllNotify', token)
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: (err as any).response.data.msg },
        })
    }
}
