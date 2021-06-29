import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { POST_TYPES } from './Redux/actions/postAction'
import { GLOBALTYPES } from './Redux/actions/globalTypes'
import { NOTIFY_TYPES } from './Redux/actions/notifyAction'
import { MESS_TYPES } from './Redux/actions/messageAction'

import audiobell from './assets/audio/got-it-done-613.mp3'

const spawnNotification = (body: string, icon: string, url: string, title: string) => {
    let options = {
        body,
        icon,
    }
    let n = new Notification(title, options)

    n.onclick = e => {
        e.preventDefault()
        window.open(url, '_blank')
    }
}

const SocketClient = () => {
    const { auth, socket, notify, online, call }: any = useSelector(state => state)
    const dispatch = useDispatch()

    const audioRef = useRef<any>()

    // joinUser
    useEffect(() => {
        socket.emit('joinUser', auth.user)
    }, [socket, auth.user])

    // Likes
    useEffect(() => {
        socket.on('likeToClient', (newPost: any) => {
            dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost })
        })

        return () => socket.off('likeToClient')
    }, [socket, dispatch])

    useEffect(() => {
        socket.on('unLikeToClient', (newPost: any) => {
            dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost })
        })

        return () => socket.off('unLikeToClient')
    }, [socket, dispatch])

    // Comments
    useEffect(() => {
        socket.on('createCommentToClient', (newPost: any) => {
            dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost })
        })

        return () => socket.off('createCommentToClient')
    }, [socket, dispatch])

    useEffect(() => {
        socket.on('deleteCommentToClient', (newPost: any) => {
            dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost })
        })

        return () => socket.off('deleteCommentToClient')
    }, [socket, dispatch])

    // Follow
    useEffect(() => {
        socket.on('followToClient', (newUser: any) => {
            dispatch({ type: GLOBALTYPES.AUTH, payload: { ...auth, user: newUser } })
        })

        return () => socket.off('followToClient')
    }, [socket, dispatch, auth])

    useEffect(() => {
        socket.on('unFollowToClient', (newUser: any) => {
            dispatch({ type: GLOBALTYPES.AUTH, payload: { ...auth, user: newUser } })
        })

        return () => socket.off('unFollowToClient')
    }, [socket, dispatch, auth])

    // Notification
    useEffect(() => {
        socket.on('createNotifyToClient', (msg: any) => {
            dispatch({ type: NOTIFY_TYPES.CREATE_NOTIFY, payload: msg })

            if (notify.sound && audioRef.current) audioRef.current.play()
            spawnNotification(
                msg.user.username + ' ' + msg.text,
                msg.user.avatar,
                msg.url,
                'Vermillion'
            )
        })

        return () => socket.off('createNotifyToClient')
    }, [socket, dispatch, notify.sound])

    useEffect(() => {
        socket.on('removeNotifyToClient', (msg: any) => {
            dispatch({ type: NOTIFY_TYPES.REMOVE_NOTIFY, payload: msg })
        })

        return () => socket.off('removeNotifyToClient')
    }, [socket, dispatch])

    // Message
    useEffect(() => {
        socket.on('addMessageToClient', (msg: any) => {
            dispatch({ type: MESS_TYPES.ADD_MESSAGE, payload: msg })

            dispatch({
                type: MESS_TYPES.ADD_USER,
                payload: {
                    ...msg.user,
                    text: msg.text,
                    media: msg.media,
                },
            })
        })

        return () => socket.off('addMessageToClient')
    }, [socket, dispatch])

    // Check User Online / Offline
    useEffect(() => {
        socket.emit('checkUserOnline', auth.user)
    }, [socket, auth.user])

    useEffect(() => {
        socket.on('checkUserOnlineToMe', (data: any) => {
            data.forEach((item: any) => {
                if (!online.includes(item.id)) {
                    dispatch({ type: GLOBALTYPES.ONLINE, payload: item.id })
                }
            })
        })

        return () => socket.off('checkUserOnlineToMe')
    }, [socket, dispatch, online])

    useEffect(() => {
        socket.on('checkUserOnlineToClient', (id: string) => {
            if (!online.includes(id)) {
                dispatch({ type: GLOBALTYPES.ONLINE, payload: id })
            }
        })

        return () => socket.off('checkUserOnlineToClient')
    }, [socket, dispatch, online])

    // Check User Offline
    useEffect(() => {
        socket.on('CheckUserOffline', (id: any) => {
            dispatch({ type: GLOBALTYPES.OFFLINE, payload: id })
        })

        return () => socket.off('CheckUserOffline')
    }, [socket, dispatch])

    // Call User
    useEffect(() => {
        socket.on('callUserToClient', (data: any) => {
            dispatch({ type: GLOBALTYPES.CALL, payload: data })
        })

        return () => socket.off('callUserToClient')
    }, [socket, dispatch])

    useEffect(() => {
        socket.on('userBusy', (data: any) => {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: `${call.username} is busy!` },
            })
        })

        return () => socket.off('userBusy')
    }, [socket, dispatch, call])

    return (
        <>
            <audio controls ref={audioRef as any} style={{ display: 'none' }}>
                <source src={audiobell} type="audio/mp3" />
            </audio>
        </>
    )
}

export default SocketClient
