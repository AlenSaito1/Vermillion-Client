import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Avatar from '../Avatar'
import { GLOBALTYPES } from '../../Redux/actions/globalTypes'
import { addMessage } from '../../Redux/actions/messageAction'
import RingRing from '../../assets/audio/ringring.mp3'

const CallModal = () => {
    const { call, auth, peer, socket, theme }: any = useSelector(state => state)
    const dispatch = useDispatch()

    const [hours, setHours] = useState(0)
    const [mins, setMins] = useState(0)
    const [second, setSecond] = useState(0)
    const [total, setTotal] = useState(0)

    const [answer, setAnswer] = useState<any>(false)
    const youVideo = useRef()
    const otherVideo = useRef()
    const [tracks, setTracks] = useState<any>(null)
    const [newCall, setNewCall] = useState<any>(null)

    // Set Time
    useEffect(() => {
        const setTime = () => {
            setTotal(t => t + 1)
            setTimeout(setTime, 1000)
        }
        setTime()

        return () => setTotal(0)
    }, [])

    useEffect(() => {
        setSecond(total % 60)
        setMins(parseInt((total / 60) as unknown as string))
        setHours(parseInt((total / 3600) as unknown as string))
    }, [total])

    // End Call
    const addCallMessage = useCallback(
        (call, times, disconnect?: any) => {
            if (call.recipient !== auth.user._id || disconnect) {
                const msg = {
                    sender: call.sender,
                    recipient: call.recipient,
                    text: '',
                    media: [],
                    call: { video: call.video, times },
                    createdAt: new Date().toISOString(),
                }
                dispatch(addMessage({ msg, auth, socket }))
            }
        },
        [auth, dispatch, socket]
    )

    const handleEndCall = () => {
        tracks && tracks.forEach((track: any) => track.stop())
        if (newCall) newCall.close()
        let times = answer ? total : 0
        socket.emit('endCall', { ...call, times })

        addCallMessage(call, times)
        dispatch({ type: GLOBALTYPES.CALL, payload: null })
    }

    useEffect(() => {
        if (answer) {
            setTotal(0)
        } else {
            const timer = setTimeout(() => {
                socket.emit('endCall', { ...call, times: 0 })
                addCallMessage(call, 0)
                dispatch({ type: GLOBALTYPES.CALL, payload: null })
            }, 15000)

            return () => clearTimeout(timer)
        }
    }, [dispatch, answer, call, socket, addCallMessage])

    useEffect(() => {
        socket.on('endCallToClient', (data: any) => {
            if (tracks) tracks.forEach((track: any) => track.stop())
            if (newCall) newCall.close()
            addCallMessage(data, data.times)
            dispatch({ type: GLOBALTYPES.CALL, payload: null })
        })

        return () => socket.off('endCallToClient')
    }, [socket, dispatch, tracks, addCallMessage, newCall])

    // Stream Media
    const openStream = (video: any) => {
        const config = { audio: true, video }
        return navigator.mediaDevices.getUserMedia(config)
    }

    const playStream = (tag: any, stream: any) => {
        let video = tag
        video.srcObject = stream
        video.play()
    }

    // Answer Call
    const handleAnswer = () => {
        openStream(call.video).then(stream => {
            playStream(youVideo.current, stream)
            const track = stream.getTracks()
            setTracks(track)

            const newCall = peer.call(call.peerId, stream)
            newCall.on('stream', function (remoteStream: any) {
                playStream(otherVideo.current, remoteStream)
            })
            setAnswer(true)
            setNewCall(newCall)
        })
    }

    useEffect(() => {
        peer.on('call', (newCall: any) => {
            openStream(call.video).then(stream => {
                if (youVideo.current) {
                    playStream(youVideo.current, stream)
                }
                const track = stream.getTracks()
                setTracks(track)

                newCall.answer(stream)
                newCall.on('stream', function (remoteStream: any) {
                    if (otherVideo.current) {
                        playStream(otherVideo.current, remoteStream)
                    }
                })
                setAnswer(true)
                setNewCall(newCall)
            })
        })
        return () => peer.removeListener('call')
    }, [peer, call.video])

    // Disconnect
    useEffect(() => {
        socket.on('callerDisconnect', () => {
            tracks && tracks.forEach((track: any) => track.stop())
            if (newCall) newCall.close()
            let times = answer ? total : 0
            addCallMessage(call, times, true)

            dispatch({ type: GLOBALTYPES.CALL, payload: null })

            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: `The ${call.username} disconnect` },
            })
        })

        return () => socket.off('callerDisconnect')
    }, [socket, tracks, dispatch, call, addCallMessage, answer, total, newCall])

    // Play - Pause Audio
    const playAudio = (newAudio: any) => {
        newAudio.play()
    }

    const pauseAudio = (newAudio: any) => {
        newAudio.pause()
        newAudio.currentTime = 0
    }

    useEffect(() => {
        let newAudio = new Audio(RingRing)
        if (answer) {
            pauseAudio(newAudio)
        } else {
            playAudio(newAudio)
        }

        return () => pauseAudio(newAudio)
    }, [answer])

    return (
        <div className="call_modal">
            <div
                className="call_box"
                style={{
                    display: answer && call.video ? 'none' : 'flex',
                }}
            >
                <div className="text-center" style={{ padding: '40px 0' }}>
                    <Avatar src={call.avatar} size="supper-avatar" />
                    <h4>{call.username}</h4>
                    <h6>{call.fullname}</h6>

                    {answer ? (
                        <div>
                            <span>
                                {hours.toString().length < 2 ? '0' + hours : hours}
                            </span>
                            <span>:</span>
                            <span>{mins.toString().length < 2 ? '0' + mins : mins}</span>
                            <span>:</span>
                            <span>
                                {second.toString().length < 2 ? '0' + second : second}
                            </span>
                        </div>
                    ) : (
                        <div> 
                            <span>Calling..</span>
                        </div>
                    )}
                </div>

                {!answer && (
                    <div className="timer">
                        <small>{mins.toString().length < 2 ? '0' + mins : mins}</small>
                        <small>:</small>
                        <small>
                            {second.toString().length < 2 ? '0' + second : second}
                        </small>
                    </div>
                )}

                <div className="call_menu">
                    <button
                        className="material-icons text-danger"
                        onClick={handleEndCall}
                    >
                        call_end
                    </button>

                    {call.recipient === auth.user._id && !answer && (
                        <>
                            {call.video ? (
                                <button
                                    className="material-icons text-success"
                                    onClick={handleAnswer}
                                >
                                    videocam
                                </button>
                            ) : (
                                <button
                                    className="material-icons text-success"
                                    onClick={handleAnswer}
                                >
                                    call
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div
                className="show_video"
                style={{
                    opacity: answer && call.video ? '1' : '0',
                    filter: theme ? 'invert(1)' : 'invert(0)',
                }}
            >
                <video ref={youVideo as any} className="you_video" playsInline muted />
                <video ref={otherVideo as any} className="other_video" playsInline />

                <div className="time_video">
                    <span>{hours.toString().length < 2 ? '0' + hours : hours}</span>
                    <span>:</span>
                    <span>{mins.toString().length < 2 ? '0' + mins : mins}</span>
                    <span>:</span>
                    <span>{second.toString().length < 2 ? '0' + second : second}</span>
                </div>

                <button
                    className="material-icons text-danger end_call"
                    onClick={handleEndCall}
                >
                    call_end
                </button>
            </div>
        </div>
    )
}

export default CallModal
