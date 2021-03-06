import React, { useState, useEffect, useRef } from 'react'
import UserCard from '../UserCard'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'
import MsgDisplay from './MsgDisplay'
import Icons from '../Icons'
import { GLOBALTYPES } from '../../Redux/actions/globalTypes'
import { imageShow, videoShow } from '../../utils/MediaShow'
import { imageUpload } from '../../utils/ImageUpload'
import {
    addMessage,
    getMessages,
    loadMoreMessages,
    deleteConversation,
} from '../../Redux/actions/messageAction'
import LoadIcon from '../../assets/images/loading.gif'

const RightSide = () => {
    const { auth, message, theme, socket, peer }: any = useSelector(state => state)
    const dispatch = useDispatch()

    const { id }: any = useParams()
    const [user, setUser] = useState<any>([])
    const [text, setText] = useState('')
    const [media, setMedia] = useState<any>([])
    const [loadMedia, setLoadMedia] = useState(false)

    const refDisplay = useRef<any>()
    const pageEnd = useRef()

    const [data, setData] = useState([])
    const [result, setResult] = useState(9)
    const [page, setPage] = useState(0)
    const [isLoadMore, setIsLoadMore] = useState(0)

    const history = useHistory()

    useEffect(() => {
        const newData = message.data.find((item: { _id: string }) => item._id === id)
        if (newData) {
            setData(newData.messages)
            setResult(newData.result)
            setPage(newData.page)
        }
    }, [message.data, id])

    useEffect(() => {
        if (id && message.users.length > 0) {
            setTimeout(() => {
                refDisplay?.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
            }, 50)

            const newUser = message.users.find((user: { _id: string }) => user._id === id)
            if (newUser) setUser(newUser)
        }
    }, [message.users, id])

    const handleChangeMedia = (e: any) => {
        const files = [...e.target.files]
        let err = ''
        let newMedia: any[] = []

        files.forEach(file => {
            if (!file) return (err = 'File does not exist.')

            if (file.size > 1024 * 1024 * 5) {
                return (err = 'The image/video largest is 5mb.')
            }

            return newMedia.push(file)
        })

        if (err) dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err } })
        setMedia([...media, ...newMedia])
    }

    const handleDeleteMedia = (index: number) => {
        const newArr = [...media]
        newArr.splice(index, 1)
        setMedia(newArr)
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        if (!text.trim() && media.length === 0) return
        setText('')
        setMedia([])
        setLoadMedia(true)

        let newArr: any[] = []
        if (media.length > 0) newArr = await imageUpload(media)

        const msg = {
            sender: auth.user._id,
            recipient: id,
            text,
            media: newArr,
            createdAt: new Date().toISOString(),
        }

        setLoadMedia(false)
        await dispatch(addMessage({ msg, auth, socket }))
        if (refDisplay.current) {
            refDisplay.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
    }

    useEffect(() => {
        const getMessagesData = async () => {
            if (message.data.every((item: { _id: string }) => item._id !== id)) {
                await dispatch(getMessages({ auth, id }))
                setTimeout(() => {
                    refDisplay.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end',
                    })
                }, 50)
            }
        }
        getMessagesData()
    }, [id, dispatch, auth, message.data])

    // Load More
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setIsLoadMore(p => p + 1)
                }
            },
            {
                threshold: 0.1,
            }
        )

        observer.observe(pageEnd.current as unknown as Element)
    }, [setIsLoadMore])

    useEffect(() => {
        if (isLoadMore > 1) {
            if (result >= page * 9) {
                dispatch(loadMoreMessages({ auth, id, page: page + 1 }))
                setIsLoadMore(1)
            }
        }
        // eslint-disable-next-line
    }, [isLoadMore])

    const handleDeleteConversation = () => {
        if (window.confirm('Do you want to delete?')) {
            dispatch(deleteConversation({ auth, id }))
            return history.push('/message')
        }
    }

    // Call
    const caller = ({ video }: any) => {
        const { _id, avatar, username, fullname }: any = user

        const msg = {
            sender: auth.user._id,
            recipient: _id,
            avatar,
            username,
            fullname,
            video,
        }
        dispatch({ type: GLOBALTYPES.CALL, payload: msg })
    }

    const callUser = ({ video }: any) => {
        const { _id, avatar, username, fullname } = auth.user

        const msg = {
            sender: _id,
            recipient: user._id,
            avatar,
            username,
            fullname,
            video,
        }

        if (peer.open) (msg as any).peerId = peer._id

        socket.emit('callUser', msg)
    }

    const handleAudioCall = () => {
        caller({ video: false })
        callUser({ video: false })
    }

    const handleVideoCall = () => {
        caller({ video: true })
        callUser({ video: true })
    }

    return (
        <>
            <div className="message_header" style={{ cursor: 'pointer' }}>
                {user.length !== 0 && (
                    <UserCard user={user}>
                        <div>
                            <i className="fas fa-phone-alt" onClick={handleAudioCall} />

                            <i className="fas fa-video mx-3" onClick={handleVideoCall} />

                            <i
                                className="fas fa-trash text-danger"
                                onClick={handleDeleteConversation}
                            />
                        </div>
                    </UserCard>
                )}
            </div>

            <div
                className="chat_container"
                style={{ height: media.length > 0 ? 'calc(100% - 180px)' : '' }}
            >
                <div className="chat_display" ref={refDisplay}>
                    <button
                        style={{ marginTop: '-25px', opacity: 0 }}
                        ref={pageEnd as any}
                    >
                        Load more
                    </button>

                    {data.map((msg, index) => (
                        <div key={index}>
                            {(msg as any).sender !== auth.user._id && (
                                <div className="chat_row other_message">
                                    <MsgDisplay user={user} msg={msg} theme={theme} />
                                </div>
                            )}

                            {(msg as any).sender === auth.user._id && (
                                <div className="chat_row you_message">
                                    <MsgDisplay
                                        user={auth.user}
                                        msg={msg}
                                        theme={theme}
                                        data={data}
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {loadMedia && (
                        <div className="chat_row you_message">
                            <img src={LoadIcon} alt="loading" />
                        </div>
                    )}
                </div>
            </div>

            <div
                className="show_media"
                style={{ display: media.length > 0 ? 'grid' : 'none' }}
            >
                {media.map((item: { type: string }, index: number) => (
                    <div key={index} id="file_media">
                        {item.type.match(/video/i)
                            ? videoShow(URL.createObjectURL(item), theme)
                            : imageShow(URL.createObjectURL(item), theme)}
                        <span onClick={() => handleDeleteMedia(index)}>&times;</span>
                    </div>
                ))}
            </div>

            <form className="chat_input" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter you message..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    style={{
                        filter: theme ? 'invert(1)' : 'invert(0)',
                        background: theme ? '#040404' : '',
                        color: theme ? 'white' : '',
                    }}
                />

                <Icons setContent={setText} content={text} theme={theme} />

                <div className="file_upload">
                    <i className="fas fa-image text-danger" />
                    <input
                        type="file"
                        name="file"
                        id="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleChangeMedia}
                    />
                </div>

                <button
                    type="submit"
                    className="material-icons"
                    disabled={text || media.length > 0 ? false : true}
                >
                    near_me
                </button>
            </form>
        </>
    )
}

export default RightSide
