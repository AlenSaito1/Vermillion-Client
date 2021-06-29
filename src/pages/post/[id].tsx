import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getPost } from '../../Redux/actions/postAction'
import LoadIcon from '../../assets/images/loading.gif'
import PostCard from '../../components/PostCard'

const Post = () => {
    const { id }: any = useParams()
    const [post, setPost] = useState([])

    const { auth, detailPost }: any = useSelector(state => state)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getPost({ detailPost, id, auth }))

        if (detailPost.length > 0) {
            const newArr = detailPost.filter((post: { _id: string }) => post._id === id)
            setPost(newArr)
        }
    }, [detailPost, dispatch, id, auth])

    return (
        <div className="posts">
            {post.length === 0 && (
                <img src={LoadIcon} alt="loading" className="d-block mx-auto my-4" />
            )}

            {post.map((item: { _id: string }) => (
                <PostCard key={item._id} post={item} />
            ))}
        </div>
    )
}

export default Post
