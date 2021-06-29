import { GLOBALTYPES } from './globalTypes'
import { imageUpload } from '../../utils/ImageUpload'
import {
    postDataAPI,
    getDataAPI,
    patchDataAPI,
    deleteDataAPI,
} from '../../utils/fetchData'
import { createNotify, removeNotify } from './notifyAction'

export enum POST_TYPES {
    CREATE_POST = 'CREATE_POST',
    LOADING_POST = 'LOADING_POST',
    GET_POSTS = 'GET_POSTS',
    UPDATE_POST = 'UPDATE_POST',
    GET_POST = 'GET_POST',
    DELETE_POST = 'DELETE_POST',
}

export const createPost =
    ({ content, images, auth, socket }: any) =>
    async (dispatch: any) => {
        let media: any[] = []
        try {
            dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
            if (images.length > 0) media = await imageUpload(images)

            const res = await postDataAPI('posts', { content, images: media }, auth.token)

            dispatch({
                type: POST_TYPES.CREATE_POST,
                payload: { ...res.data.newPost, user: auth.user },
            })

            dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })

            // Notify
            const msg = {
                id: res.data.newPost._id,
                text: 'added a new post.',
                recipients: res.data.newPost.user.followers,
                url: `/post/${res.data.newPost._id}`,
                content,
                image: media[0].url,
            }

            dispatch(createNotify({ msg, auth, socket }))
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }

export const getPosts = (token: any) => async (dispatch: any) => {
    try {
        dispatch({ type: POST_TYPES.LOADING_POST, payload: true })
        const res = await getDataAPI('posts', token)

        dispatch({
            type: POST_TYPES.GET_POSTS,
            payload: { ...res.data, page: 2 },
        })

        dispatch({ type: POST_TYPES.LOADING_POST, payload: false })
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: (err as any).response.data.msg },
        })
    }
}

export const updatePost =
    ({ content, images, auth, status }: any) =>
    async (dispatch: any) => {
        let media: any[] = []
        const imgNewUrl = images.filter((img: { url: string }) => !img.url)
        const imgOldUrl = images.filter((img: { url: string }) => img.url)

        if (
            status.content === content &&
            imgNewUrl.length === 0 &&
            imgOldUrl.length === status.images.length
        )
            return

        try {
            dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
            if (imgNewUrl.length > 0) media = await imageUpload(imgNewUrl)

            const res = await patchDataAPI(
                `post/${status._id}`,
                {
                    content,
                    images: [...imgOldUrl, ...media],
                },
                auth.token
            )

            dispatch({ type: POST_TYPES.UPDATE_POST, payload: res.data.newPost })

            dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }

export const likePost =
    ({ post, auth, socket }: any) =>
    async (dispatch: any) => {
        const newPost = { ...post, likes: [...post.likes, auth.user] }
        dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost })

        socket.emit('likePost', newPost)

        try {
            await patchDataAPI(`post/${post._id}/like`, null, auth.token)

            // Notify
            const msg = {
                id: auth.user._id,
                text: 'like your post.',
                recipients: [post.user._id],
                url: `/post/${post._id}`,
                content: post.content,
                image: post.images[0].url,
            }

            dispatch(createNotify({ msg, auth, socket }))
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }

export const unLikePost =
    ({ post, auth, socket }: any) =>
    async (dispatch: any) => {
        const newPost = {
            ...post,
            likes: post.likes.filter(
                (like: { _id: string }) => like._id !== auth.user._id
            ),
        }
        dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost })

        socket.emit('unLikePost', newPost)

        try {
            await patchDataAPI(`post/${post._id}/unlike`, null, auth.token)

            // Notify
            const msg = {
                id: auth.user._id,
                text: 'like your post.',
                recipients: [post.user._id],
                url: `/post/${post._id}`,
            }
            dispatch(removeNotify({ msg, auth, socket }))
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }

export const getPost =
    ({ detailPost, id, auth }: any) =>
    async (dispatch: any) => {
        if (detailPost.every((post: { _id: any }) => post._id !== id)) {
            try {
                const res = await getDataAPI(`post/${id}`, auth.token)
                dispatch({ type: POST_TYPES.GET_POST, payload: res.data.post })
            } catch (err) {
                dispatch({
                    type: GLOBALTYPES.ALERT,
                    payload: { error: (err as any).response.data.msg },
                })
            }
        }
    }

export const deletePost =
    ({ post, auth, socket }: any) =>
    async (dispatch: any) => {
        dispatch({ type: POST_TYPES.DELETE_POST, payload: post })

        try {
            const res = await deleteDataAPI(`post/${post._id}`, auth.token)

            // Notify
            const msg = {
                id: post._id,
                text: 'added a new post.',
                recipients: res.data.newPost.user.followers,
                url: `/post/${post._id}`,
            }
            dispatch(removeNotify({ msg, auth, socket }))
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }

export const savePost =
    ({ post, auth }: { post: any; auth: any }) =>
    async (dispatch: any) => {
        const newUser = { ...auth.user, saved: [...auth.user.saved, post._id] }
        dispatch({ type: GLOBALTYPES.AUTH, payload: { ...auth, user: newUser } })

        try {
            await patchDataAPI(`savePost/${post._id}`, null, auth.token)
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }

export const unSavePost =
    ({ post, auth }: { post: any; auth: any }) =>
    async (dispatch: any) => {
        const newUser = {
            ...auth.user,
            saved: auth.user.saved.filter((id: string) => id !== post._id),
        }
        dispatch({ type: GLOBALTYPES.AUTH, payload: { ...auth, user: newUser } })

        try {
            await patchDataAPI(`unSavePost/${post._id}`, null, auth.token)
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: (err as any).response.data.msg },
            })
        }
    }
